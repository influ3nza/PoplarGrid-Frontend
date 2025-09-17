export interface ReqLoginUser {
    email: string
    password: string
}

export interface LoginUser {
    email: string
    password: string
}

export interface RspUser {
    user_id: number
    
    nickname: string
    email: string
    qq_number: number | null

    moetran_id: string
    moetran_token: string

    created_at: string
}

export interface User {
    userId: number

    nickname: string
    email: string
    qqNumber: number | null

    moetranId: string
    moetranToken: string

    createdAt: string
}
