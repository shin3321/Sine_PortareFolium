import type { ResumeProject } from "@/types/resume";
import { renderMarkdown } from "@/lib/markdown";
import { getPortfolioItem } from "@/lib/queries";

// 날짜 포맷
const formatDateRange = (startDate?: string, endDate?: string): string =>
    `${startDate || ""} ~ ${endDate || "Present"}`;

interface Props {
    projects: ResumeProject[];
    label?: string;
    badge?: string;
}

// 프로젝트 섹션 렌더링 (markdown 렌더링 및 portfolio fetch 자체 처리)
export default async function ProjectsSection({
    projects,
    label = "프로젝트",
    badge,
}: Props) {
    if (projects.length === 0) return null;

    // sections markdown 렌더링
    const projectsMarkdown = await Promise.all(
        projects.map(async (proj) => {
            if (!proj.sections) return [] as (string | null)[];
            return Promise.all(
                proj.sections.map((sec) =>
                    sec.markdown ? renderMarkdown(sec.content) : null
                )
            );
        })
    );

    // portfolioSlug 연결 항목 fetch
    const portfolioSlugs = projects
        .map((p) => p.portfolioSlug)
        .filter((s): s is string => Boolean(s));
    const portfolioItemsArr = await Promise.all(
        portfolioSlugs.map((slug) => getPortfolioItem(slug))
    );
    const portfolioItemMap: Record<string, (typeof portfolioItemsArr)[number]> =
        Object.fromEntries(
            portfolioSlugs.map((slug, i) => [slug, portfolioItemsArr[i]])
        );

    return (
        <section className="mb-10">
            <h2
                className={`mb-5 border-b border-(--color-border) pb-1.5 text-xl font-bold tracking-widest text-(--color-accent) uppercase ${badge ? "flex items-center gap-3" : ""}`}
            >
                {label}
                {badge ? (
                    <span className="rounded-full bg-(--color-accent) px-3 py-0.5 text-xs font-bold tracking-widest text-(--color-on-accent) normal-case">
                        {badge}
                    </span>
                ) : null}
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-4">
                {projects.map((project, pIdx) => {
                    const pf = project.portfolioSlug
                        ? portfolioItemMap[project.portfolioSlug]
                        : null;
                    const pfData = pf?.data as
                        | {
                              role?: string;
                              teamSize?: string | number;
                              github?: string;
                          }
                        | undefined;
                    const pfTags = pf?.tags as string[] | undefined;
                    return (
                        <div
                            key={pIdx}
                            className="group relative overflow-hidden rounded-lg border border-(--color-border) bg-(--color-surface-subtle) transition-colors hover:border-(--color-accent)"
                        >
                            {project.portfolioSlug ? (
                                <a
                                    href={`/portfolio/${project.portfolioSlug}`}
                                    className="absolute inset-0 z-0"
                                    aria-label={project.name ?? ""}
                                />
                            ) : null}
                            {/* Thumbnail */}
                            {pf?.thumbnail ? (
                                <div className="relative aspect-video w-full overflow-hidden bg-(--color-border)">
                                    <img
                                        src={pf.thumbnail as string}
                                        alt={project.name ?? ""}
                                        className="h-full w-full object-cover"
                                        loading="lazy"
                                    />
                                </div>
                            ) : null}
                            <div className="p-4">
                                {/* Name */}
                                {project.name ? (
                                    <h3 className="relative z-10 m-0 mb-1.5 text-base leading-snug font-bold text-(--color-foreground) transition-colors group-hover:text-(--color-accent)">
                                        {project.url ? (
                                            <a
                                                href={project.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-(--color-link) no-underline hover:opacity-80"
                                            >
                                                {project.name}
                                            </a>
                                        ) : (
                                            project.name
                                        )}
                                    </h3>
                                ) : null}
                                {/* Tags from portfolio */}
                                {pfTags && pfTags.length > 0 ? (
                                    <div className="relative z-10 mb-2 flex flex-wrap gap-1">
                                        {pfTags.slice(0, 5).map((tag, tIdx) => (
                                            <span
                                                key={tIdx}
                                                className="inline-block rounded bg-(--color-tag-bg) px-[0.45em] py-[0.1em] text-xs leading-normal font-medium text-(--color-tag-fg)"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                ) : null}
                                {/* GitHub */}
                                {pfData?.github ? (
                                    <div className="relative z-10 mb-2">
                                        <a
                                            href={pfData.github}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 rounded-full border border-(--color-border) px-2.5 py-0.5 text-xs font-medium text-(--color-foreground) transition-colors hover:border-(--color-accent) hover:text-(--color-accent)"
                                        >
                                            GitHub
                                            <svg
                                                className="h-3 w-3"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                                />
                                            </svg>
                                        </a>
                                    </div>
                                ) : null}
                                {/* Role · Team size */}
                                {pfData?.role || pfData?.teamSize ? (
                                    <p className="relative z-10 m-0 mb-1.5 text-xs text-(--color-muted)">
                                        {[
                                            pfData.role,
                                            pfData.teamSize
                                                ? `${pfData.teamSize}인`
                                                : null,
                                        ]
                                            .filter(Boolean)
                                            .join(" · ")}
                                    </p>
                                ) : null}
                                {/* Date range */}
                                {(project.startDate || project.endDate) && (
                                    <div
                                        className="relative z-10 mb-2 text-sm text-(--color-muted)"
                                        style={{
                                            fontVariantNumeric: "tabular-nums",
                                        }}
                                    >
                                        {formatDateRange(
                                            project.startDate,
                                            project.endDate
                                        )}
                                    </div>
                                )}
                                {/* Content */}
                                {project.sections &&
                                project.sections.length > 0 ? (
                                    project.sections.map((sec, sIdx) => (
                                        <div key={sIdx} className="mt-2">
                                            {sec.title ? (
                                                <p className="m-0 mb-0.5 text-base font-semibold tracking-wider text-(--color-muted) uppercase">
                                                    {sec.title}
                                                </p>
                                            ) : null}
                                            {projectsMarkdown[pIdx]?.[sIdx] ? (
                                                <div
                                                    className="resume-markdown m-0 text-base leading-[1.6] text-(--color-foreground)"
                                                    dangerouslySetInnerHTML={{
                                                        __html: projectsMarkdown[
                                                            pIdx
                                                        ][sIdx]!,
                                                    }}
                                                />
                                            ) : (
                                                <p className="m-0 text-base leading-[1.6] whitespace-pre-wrap text-(--color-foreground)">
                                                    {sec.content}
                                                </p>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <>
                                        {project.description ? (
                                            <p className="m-0 text-base leading-[1.6] whitespace-pre-wrap text-(--color-foreground)">
                                                {project.description}
                                            </p>
                                        ) : null}
                                        {project.highlights &&
                                        project.highlights.length > 0 ? (
                                            <ul className="mt-1 mb-0 pl-2 text-base text-(--color-foreground)">
                                                {project.highlights.map(
                                                    (h, hIdx) => (
                                                        <li
                                                            key={hIdx}
                                                            className="mb-[0.2em]"
                                                        >
                                                            {`• ${h}`}
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        ) : null}
                                    </>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
