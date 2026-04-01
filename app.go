package main

import (
	"context"
	"fmt"
	"time"

	"github.com/playwright-community/playwright-go"
	"github.com/xuri/excelize/v2"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// App struct
type App struct {
	ctx context.Context
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx

	// バックグラウンドでブラウザの準備を確認
    go func() {
        fmt.Println("Playwrightのブラウザチェックを開始...")
        
        // Install() を呼ぶと、すでに存在すれば何もしない、
        // なければダウンロードしてくれます。
        err := playwright.Install()
        if err != nil {
            fmt.Printf("ブラウザの自動インストールに失敗: %v\n", err)
            // ここで runtime.EventsEmit を使ってフロントに「エラー」を伝えても良い
        } else {
            fmt.Println("ブラウザの準備が完了しました")
        }
    }()
}

func (a *App) StartRPA(filePath string) string {
	// -------------------- EXCELのセットアップ --------------------
	f, err := excelize.OpenFile(filePath)
	if err != nil {
		return fmt.Sprintf("Excelファイルを開けませんでした: %v", err)
	}
	defer f.Close()

	rows, err := f.GetRows("Sheet1")
	if err != nil {
		return fmt.Sprintf("Excelシートの行を取得できませんでした: %v", err)
	}

	// -------------------- Playwrightのセットアップ --------------------
	pw, err := playwright.Run()
	if err != nil {
		return fmt.Sprintf("Playwrightを起動できませんでした: %v", err)
	}
	defer pw.Stop()

	browser, err := pw.Chromium.Launch(playwright.BrowserTypeLaunchOptions{
		Headless: playwright.Bool(false), // ブラウザを表示する
	})
	if err != nil {
		return fmt.Sprintf("ブラウザを起動できませんでした: %v", err)
	}
	defer browser.Close()

	page, err := browser.NewPage()
	if err != nil {
		return fmt.Sprintf("新しいページを作成できませんでした: %v", err)
	}

	// サイトに移動
	if _, err = page.Goto("https://www.rpachallenge.com/"); err != nil {
		return fmt.Sprintf("サイトに移動できませんでした: %v", err)
	}

	// STARTボタンをクリック
	if err = page.GetByRole("button", playwright.PageGetByRoleOptions{
		Name: "Start",
	}).Click(); err != nil {
		return fmt.Sprintf("STARTボタンをクリックできませんでした: %v", err)
	}

	// -------------------- データ転記 --------------------
	total := len(rows) - 1 // 全データ数（ヘッダーを除く）
	for i, row := range rows {
		if i == 0 {
			continue // ヘッダー行をスキップ
		}

		page.Locator("[ng-reflect-name='labelFirstName']").Fill(row[0])
		page.Locator("[ng-reflect-name='labelLastName']").Fill(row[1])
		page.Locator("[ng-reflect-name='labelCompanyName']").Fill(row[2])
		page.Locator("[ng-reflect-name='labelRole']").Fill(row[3])
		page.Locator("[ng-reflect-name='labelAddress']").Fill(row[4])
		page.Locator("[ng-reflect-name='labelEmail']").Fill(row[5])
		page.Locator("[ng-reflect-name='labelPhone']").Fill(row[6])

		if err = page.GetByRole("button", playwright.PageGetByRoleOptions{Name: "Submit"}).Click(); err != nil {
			return fmt.Sprintf("送信ボタンをクリックできませんでした: %v", err)
		}

		runtime.EventsEmit(a.ctx, "process_update", i, total)
		time.Sleep(500 * time.Millisecond) // サイトの反応を待つための微調整
	}

	time.Sleep(5 * time.Second) // 結果を確認するための待機
	return ("すべてのデータの転記が終了しました。")
}


func (a *App) SelectFile() string {
	selection, err := runtime.OpenFileDialog(a.ctx, runtime.OpenDialogOptions{
		Title: "エクセルファイルを選択してください",
		Filters: []runtime.FileFilter{
			{DisplayName: "Excel Files (*.xlsx;*.csv)", Pattern: "*.xlsx;*.csv"},
		},
	})
	if err != nil {
		return ""
	}
	return selection
}