export interface ReqNewMember {
    team_id: number
    user_id: number

    for_image_source: boolean
    for_retoucher: boolean
    for_translator: boolean
    for_proofreader: boolean
    for_embedder: boolean
    for_reviewer: boolean
    for_publisher: boolean
}

export interface NewMember {
    teamId: number
    userId: number

    forImageSource: boolean
    forRetoucher: boolean
    forTranslator: boolean
    forProofreader: boolean
    forEmbedder: boolean
    forReviewer: boolean
    forPublisher: boolean
}

export interface ReqPatchMemberRole {
    team_id: number
    team_member_id: number

    for_leader: boolean
    for_admin: boolean

    for_image_source: boolean
    for_retoucher: boolean
    for_translator: boolean
    for_proofreader: boolean
    for_embedder: boolean
    for_reviewer: boolean
    for_publisher: boolean
}

/// ModifyMemberRole 中的所有字段并非必须，设置为 undefined 表示不修改该字段
/// 注意：当 forLeader 为 true 时，将会自动转让组长职位给该成员
export interface PatchMemberRole {
    teamId: number
    teamMemberId: number

    forLeader: boolean | undefined
    forAdmin: boolean | undefined

    forImageSource: boolean | undefined
    forRetoucher: boolean | undefined
    forTranslator: boolean | undefined
    forProofreader: boolean | undefined
    forEmbedder: boolean | undefined
    forReviewer: boolean | undefined
    forPublisher: boolean | undefined
}

export interface RspMember {
    team_member_id: number

    user_id: number
    nickname: string
    email: string
    qq_number: number | undefined

    team_id: number

    is_leader: boolean
    is_admin: boolean

    is_image_source: boolean
    is_retoucher: boolean
    is_translator: boolean
    is_proofreader: boolean
    is_embedder: boolean
    is_reviewer: boolean
    is_publisher: boolean

    joined_at: string
}

/// Member 中不含有 user 的尨译 ID 和 token
/// 相关数据只存在于 User 中
export interface Member {
    teamMemberId: number

    userId: number
    nickname: string
    email: string
    qqNumber: number | undefined
    
    teamId: number

    isLeader: boolean
    isAdmin: boolean

    isImageSource: boolean
    isRetoucher: boolean
    isTranslator: boolean
    isProofreader: boolean
    isEmbedder: boolean
    isReviewer: boolean
    isPublisher: boolean

    joinedAt: string
}