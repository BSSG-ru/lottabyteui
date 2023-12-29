import { ArtifactMetaData } from "./artifact";

export type WorkflowActionParam = {
    id: string;
    name: string;
    display_name: string;
    type: string;
    required: boolean;
};

export type WorkflowActionParamResult = {
    id: string;
    param_name: string;
    param_type: string;
    param_value: string;
};

export type WorkflowAction = {
    id: string;
    workflow_task_id: string;
    display_name: string;
    description: string;
    post_url: string;
    params: WorkflowActionParam[];
};

export type WorkflowTaskEntity = {
    artifact_id: string;
    artifact_type: string;
    workflow_id: string;
    workflow_state: string;
    actions: WorkflowAction[];
};

export type WorkflowTask = {
    entity: WorkflowTaskEntity;
    metadata: ArtifactMetaData;
};