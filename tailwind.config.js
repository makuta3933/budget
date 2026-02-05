/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // 無印良品風カラーパレット
                muji: {
                    bg: '#F7F7F7',       // オフホワイト背景
                    card: '#FFFFFF',    // カード背景（白）
                    text: '#333333',    // メインテキスト
                    border: '#DDDDDD',  // ボーダー
                    expense: '#BF0000', // 支出（エンジ色）
                    income: '#2D4C76',  // 収入（藍色）
                    muted: '#888888',   // サブテキスト
                }
            },
            fontFamily: {
                sans: ['"Noto Sans JP"', 'Helvetica Neue', 'Arial', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
