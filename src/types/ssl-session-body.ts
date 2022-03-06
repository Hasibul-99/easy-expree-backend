export interface SslSessionBody {
    store_id: string,
    store_passwd: string,
    total_amount: number,
    currency: string,
    tran_id: string,
    success_url: string,
    fail_url: string,
    cancel_url: string,
    ipn_url: string,

    cus_name: string,
    cus_email: string,
    cus_add1: string,
    cus_add2?: string,
    cus_city: string,
    cus_state?: string,
    cus_postcode?: number,
    cus_country: string,
    cus_phone: string,
    cus_fax?: string,

    shipping_method: ShipingMethod,
    num_of_item: number,
    ship_name: string,

    ship_add1?: string,
    ship_add2?: string,
    ship_city?: string,
    ship_state?: string,
    ship_postcode?: number
    ship_country?: string,

    multi_card_name?: string,
    value_a?: string,
    value_b?: string,
    value_c?: string,
    value_d?: string,


    product_name: string,
    product_category: string,
    product_profile: ProductProfile,
}

export enum ShipingMethod {
    "YES" = "YES",
    "NO" = "NO",
    "Courier" = "Courier"
}

export enum ProductProfile {
    "general" = "general",
    "physical-goods" = "physical-goods",
    "non-physical-goods" = "non-physical-goods",
    "airline-tickets" = "airline-tickets",
    "travel-vertical" = "travel-vertical",
    "telecom-vertical" = "telecom-vertical"
}