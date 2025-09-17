export interface ReqNewProjectSet {
    name: string
    team_id: number
}

export interface NewProjectSet {
    name: string
    teamId: number
}

export interface RspProjectSet {
    project_set_id: number
    name: string

    team_id: number

    moetran_id: string
}

export interface ProjectSet {
    projectSetId: number
    name: string

    teamId: number

    moetranId: string
}
