import { useState, useEffect } from 'react';
import './App.css';
import {StartRPA, SelectFile} from "../wailsjs/go/main/App";
import * as runtime from "../wailsjs/runtime";

function App() {
    const [result, setResult] = useState("");
    const [filePath, setFilePath] = useState("");
    const [progress, setProgress] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        // 1. Go側からの進捗（実況中継）を受け取る
        const quitProgress = runtime.EventsOn("process_update", (current: number, total: number) => {
            const percent = Math.round((current / total) * 100);
            setProgress(percent);
        });

        // // 2. OS（Windows）からのファイルドロップを受け取る（フルパス取得用）
        // // ブラウザが「ファイルを開こうとする」のをアプリ全体で禁止する
        // const stopStandardDrop = (e: DragEvent) => {
        //     e.preventDefault();
        //     e.stopPropagation();
        // };
        // window.addEventListener("dragover", stopStandardDrop);
        // window.addEventListener("drop", stopStandardDrop);

        // // Wailsのファイルドロップ登録
        // runtime.OnFileDrop((x: number, y: number, paths: string[]) => {
        //     console.log("ドロップ検知:", paths);
        //     if (paths && paths.length > 0) {
        //         const fullPath = paths[0];
        //         setFilePath(fullPath);
        //         setResult(`準備完了: ${fullPath.split(/[\\/]/).pop()}`);
        //     }
        // }, true);

        // クリーンアップ
        return () => {
            quitProgress();
            // window.removeEventListener("dragover", stopStandardDrop);
            // window.removeEventListener("drop", stopStandardDrop);
            // runtime.OnFileDropOff(); // Wailsのドロップ監視を解除
        };
    }, []);


    const handleSelectFile = async () => {
        const path = await SelectFile();
        if (path) {
            setProgress(0);
            setFilePath(path);
            setResult("ファイルを選択しました");
        }
    };

    const run = async () => {
        if (!filePath) return alert("ファイルが選択されていません");
        if (isRunning) return;

        setIsRunning(true);
        setResult("処理中...");

        try {
            const res = await StartRPA(filePath)
            setResult(res);
        } catch (err) {
            setResult(`エラーが発生しました: ${err}`);
        } finally {
            setIsRunning(false);
        }
    }

    // ブラウザのデフォルト挙動（ファイルを開く）を防止するおまじない
    // const preventDefault = (e: React.DragEvent) => {
    //     e.preventDefault();
    //     e.stopPropagation();
    // };

    return (
        <div style={{ padding: '20px', textAlign: 'center' }}>
            <h3>RPA Challenger Pro</h3>
            <p>{result}</p>
            
            <div 
                // onDragOver={preventDefault}
                // onDragEnter={preventDefault}
                // onDrop={preventDefault}
                onClick={!isRunning ? handleSelectFile : undefined}
                style={{
                    border: '2px solid',
                    borderColor: filePath ? '#4caf50' : '#dee2e6',
                    padding: '40px 20px',
                    borderRadius: '12px',
                    background: filePath ? '#f1f8e9' : '#ffffff',
                    color: '#333',
                    pointerEvents: isRunning ? 'none' : 'auto',
                    cursor: isRunning ? 'default' : 'pointer',
                    opacity: isRunning ? 0.7 : 1,
                    transition: 'all 0.2s ease',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
                }}

                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
                {filePath ? (
                    <div style={{ wordBreak: 'break-all' }}>
                        <b>選択中:</b><br /> {filePath}
                    </div>
                ) : (
                    "クリックしてExcel または CSV ファイルを選んでください"
                )}
            </div>

            <br /><br />
            <button 
                onClick={run} 
                disabled={!filePath || isRunning} 
                style={{ padding: '10px 20px', cursor: (filePath && !isRunning) ? 'pointer' : 'not-allowed' }}>
                実行ボタン
            </button>

            {/* 進捗バーの見た目 */}
            <div style={{ width: '100%', backgroundColor: '#eee', height: '20px', borderRadius: '10px', overflow: 'hidden', margin: '20px 0' }}>
                <div style={{ width: `${progress}%`, background: '#4caf50', height: '100%', transition: 'width 0.3s' }} />
            </div>
            <span>{progress}% 完了</span>
        </div>
    )
}

export default App
