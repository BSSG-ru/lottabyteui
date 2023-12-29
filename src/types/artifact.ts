export type ArtifactMetaData = {
    id: string;
    artifact_type: string;
    version_id: string;
    history_id?: string;
    state?: string;
    workflow_task_id?: string;
    workflow_state?: string;
    published_id?: string;
    draft_id?: string;
    tags?: any[];
    ancestor_draft_id?: string;
};