export type GeneralSetting = {
    id: number;
    site_name: string;
    site_email: string;
    site_phone: string;
    site_address: string | null;
    logo: string | null;
    favicon: string | null;
    whatsapp_number: string | null;
    support_email: string | null;
    support_phone: string | null;
};

export type ThemeSetting = {
    id: number;
    primary_color: string;
    secondary_color: string;
    button_color: string;
    header_color: string;
    footer_color: string;
};

export type SocialMediaSetting = {
    id: number;
    facebook_url: string | null;
    instagram_url: string | null;
    twitter_url: string | null;
    linkedin_url: string | null;
    youtube_url: string | null;
};

export type AppSettings = {
    general: GeneralSetting | null;
    theme: ThemeSetting | null;
    social: SocialMediaSetting | null;
    social_links: Record<string, string>;
};
