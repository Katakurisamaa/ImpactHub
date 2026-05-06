export interface Tenant {
    id: string;
    name: string;
    slug: string;
    church_code: string;
    welcome_video_url?: string;
    theme_config?: any;
}

export interface Member {
    id: string;
    tenant_id: string;
    first_name: string;
    last_name: string;
}
