import { RspMember } from "./member.model"

export interface ReqNewProjectApplication {
    project_id: number
    processor_member_id: number
    applicant_member_id: number

    for_translator: boolean
    for_proofreader: boolean
    for_embedder: boolean
    for_reviewer: boolean
}

export interface NewProjectApplication {
    projectId: number
    processorMemberId: number
    applicantMemberId: number

    forTranslator: boolean
    forProofreader: boolean
    forEmbedder: boolean
    forReviewer: boolean
}

export interface RspProjectApplication {
    project_application_id: number

    project_id: number
    applicant_member: RspMember

    /// 0 表示待处理，1 表示已接受，2 表示已拒绝
    status: 0 | 1 | 2

    created_at: string
    updated_at: string
}

export interface ProjectApplication {
    projectApplicationId: number
    
    projectId: number
    applicantMember: RspMember

    /// 0 表示待处理，1 表示已接受，2 表示已拒绝
    status: 0 | 1 | 2

    createdAt: string
    updatedAt: string
}