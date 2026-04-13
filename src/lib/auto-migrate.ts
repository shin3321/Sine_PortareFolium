// 서버 시작 시 pending 마이그레이션 자동 실행
import { serverClient } from "./supabase";
import { getPendingMigrations } from "./migrations";

export async function autoMigrate(): Promise<void> {
    if (!serverClient) return;

    try {
        const { data: versionRow } = await serverClient
            .from("site_config")
            .select("value")
            .eq("key", "db_schema_version")
            .single();

        if (!versionRow?.value) return;

        const raw = versionRow.value;
        const dbVersion =
            typeof raw === "string" && raw.startsWith('"')
                ? JSON.parse(raw)
                : String(raw);

        const pending = getPendingMigrations(dbVersion);
        if (pending.length === 0) return;

        for (const migration of pending) {
            const { error } = await serverClient.rpc("exec_sql", {
                sql: migration.sql,
            });
            if (error) {
                console.error(
                    `[auto-migrate] v${migration.version} 실패: ${error.message}`
                );
                return;
            }
            console.log(`[auto-migrate] v${migration.version} 적용 완료`);
        }

        console.log(`[auto-migrate] ${pending.length}건 마이그레이션 완료`);
    } catch (err) {
        console.error("[auto-migrate] 실행 중 오류:", err);
    }
}
