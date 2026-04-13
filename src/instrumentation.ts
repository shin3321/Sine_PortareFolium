// Next.js instrumentation — 서버 시작 시 DB 마이그레이션 자동 실행
export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        const { autoMigrate } = await import("./lib/auto-migrate");
        await autoMigrate();
    }
}
