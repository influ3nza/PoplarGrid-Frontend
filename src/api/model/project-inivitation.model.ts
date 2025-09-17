import { RspMember } from "./member.model"

export interface ReqNewProjectInvitation {
    project_id: number
    inviter_member_id: number
    invitee_member_id: number

    for_translator: boolean
    for_proofreader: boolean
    for_embedder: boolean
    for_reviewer: boolean
}

export interface NewProjectInvitation {
    projectId: number
    inviterMemberId: number
    inviteeMemberId: number

    forTranslator: boolean
    forProofreader: boolean
    forEmbedder: boolean
    forReviewer: boolean
}

export interface RspProjectInvitation {
    project_invitation_id: number

    project_id: number
    inviter_member: RspMember
    invitee_member: RspMember
    
    status: 0 | 1 | 2
    
    created_at: string
    updated_at: string
}
   
export interface ProjectInvitation {
    projectInvitationId: number
    
    projectId: number
    inviterMember: RspMember
    inviteeMember: RspMember

    /// 0 表示待处理，1 表示已接受，2 表示已拒绝
    status: 0 | 1 | 2

    createdAt: string
    updatedAt: string
}
