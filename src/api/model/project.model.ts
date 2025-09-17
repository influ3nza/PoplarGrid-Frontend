import { Member, RspMember } from "./member.model"

export interface ReqNewProject {
    uploader_member_id: number

    author: string
    title: string
    description: string

    project_set_id: number 

    is_auto_joinable: boolean
}

export interface NewProject {
    uploaderMemberId: number

    author: string
    title: string
    description: string

    projectSetId: number

    isAutoJoinable: boolean
}

export interface RspProject {
    project_id: number

    uploader_member: RspMember
    participant_members: RspMember[]

    author: string
    title: string
    description: string

    project_set_id: number
    project_set_index: number

    legacy_id: number | null

    moetran_id: string

    is_auto_joinable: boolean
    
    created_at: string
    updated_at: string
}

export interface Project {
    projectId: number
    
    uploaderMember: Member
    participantMembers: Member[]

    author: string
    /// title 格式为 "【projectSetId-projectSetIndex】 [author] title"
    title: string
    description: string

    projectSetId: number
    projectSetIndex: number

    moetranId: string

    legacyId: number | null
    
    isAutoJoinable: boolean
 
    createdAt: string
    updatedAt: string
}