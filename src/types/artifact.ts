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
    created_by?: string;
};

export type DashboardEntity = {
    id: string;
    name: string;
    description?: string;
    weight: number;
    rating?: number;
    artifactType: string;
    createdBy?: string;
    isInFav?: boolean;
};

export type UserFavData = {
    id: string;
    artifact_id: string;
    artifact_type: string;
    artifact_name: string;
}