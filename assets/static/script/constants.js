baseUrl = "https://word-wand.creativebuffer.com"

urls = {
    fetchUserToken : baseUrl+"/fetch_user_token/",
    getJWTtoken : baseUrl+"/get_jwt_token/",
    apiHitCount : baseUrl+"/apihit_info/",
    saveUser : baseUrl+"/save_user/",
    getConfigureData : baseUrl+"/configuration/get_configuration_data/",
    getAdminData : baseUrl+"/get_admin_data/",
    saveDefaultConfig : baseUrl+"/configuration/save_default_configuration/",
    fetchAllUsers : baseUrl+"/fetch_all_users/",
    getResponse: baseUrl + "/get_response/",
    countAPIHit :baseUrl + "/count_api_hit/",
    adminDash:baseUrl + "/admin_dashboard/",
    accountDash:baseUrl + "/billing/accoun_owner",
    checkPricing:baseUrl + "/check_pricing/",
    getYesResponse:baseUrl+"/get_yes_response/",
    getNoResponse:baseUrl+"/get_no_response/",
    getInstructResponse:baseUrl+"/get_instruct_response/",
    getMoreInfoResponse:baseUrl+"/get_moreinfo_response/",
}

subscriptionStatus = {
    active: 'active',
    inactive:'inactive',
    cancelled:'canceled',
    noplan:'no plan',
}