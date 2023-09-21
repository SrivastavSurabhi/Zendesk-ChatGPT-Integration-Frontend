let client = ZAFClient.init();
let dev_subdomain =""
let dev_user =""
let TaskTable = $('#activity_table').DataTable()

$(document).ready(function(){
    client.context().then(function (context) {
        dev_subdomain = context["account"]["subdomain"];
    });
    client.get('currentUser').then(
        function(data) {
            let user = data['currentUser'];
            dev_user = data['currentUser']
            if (user['role'] == 'admin'){
                $('.agent-area').addClass('d-none');     
                client.context().then(function (context) {
                    subdomain = context["account"]["subdomain"];
                        saveUser(user, subdomain);
                        configureAjax(subdomain);
                        initializeProjectDataTable(user['role'], subdomain);
                    })                         
            }
            else{
                client.invoke('hide');
                $('.container-div').addClass('d-none');
                $('.payment_btn').addClass('d-none');
                $('.agent-area').removeClass('d-none');                           
            }
        });
    client.on('pane.activated', function() {
        saveUser(dev_user, dev_subdomain);
        configureAjax(dev_subdomain);
    })
    let unsavedChanges = false;

    $('#v-pills-tab a').click(function(e){
        current_tab = $(this).attr('id')
        if (current_tab == 'v-pills-configure-tab'){
            if (unsavedChanges){
                $('#confirmationPopup').modal('show')
                $('#yes_leave').one('click', function() {
                    unsavedChanges = false;
                    showhideTabs('#v-pills-configure-tab', '#v-pills-configure');
                    client.context().then(function (context) {
                        subdomain = context["account"]["subdomain"];
                        configureAjax(subdomain);
                    })   
                });
                $('#no_leave').one('click', function() {
                    e.preventDefault();
                });
            }
            else{
                client.context().then(function (context) {
                    subdomain = context["account"]["subdomain"];
                    configureAjax(subdomain);
                    showhideTabs('#v-pills-configure','#v-pills-configure-tab') 
                })
            }    
        }
        else if (current_tab == 'v-pills-activity-tab'){  
            if (unsavedChanges){
                $('#confirmationPopup').modal('show')
                $('#yes_leave').one('click', function() {
                    unsavedChanges = false;
                    showhideTabs('#v-pills-activity', '#v-pills-activity-tab');
                    TaskTable.draw();       
                });
                $('#no_leave').one('click', function() {
                    e.preventDefault();
                });
            }
            else{
                showhideTabs('#v-pills-activity','#v-pills-activity-tab') 
                TaskTable.draw();
            }
        }
        else if (current_tab == 'v-pills-admin-tab'){
            if (unsavedChanges){
                $('#confirmationPopup').modal('show')
                $('#yes_leave').one('click', function() {
                    unsavedChanges = false;
                    showhideTabs('#v-pills-admin', '#v-pills-admin-tab');
                    client.context().then(function (context) {
                        subdomain = context["account"]["subdomain"];
                        saveUser(dev_user, dev_subdomain);
                        adminAjax(subdomain);
                    });
                });
                $('#no_leave').one('click', function() {
                    e.preventDefault();
                });
            }
            else{
                showhideTabs('#v-pills-admin','#v-pills-admin-tab') 
                client.context().then(function (context) {
                    subdomain = context["account"]["subdomain"];
                    saveUser(dev_user, dev_subdomain);
                    adminAjax(subdomain);
                });
            }                           
        }
    });
    
    const form = $('#account_owner_form');
    form.on('input', function () {
        unsavedChanges = true;
    });

    $('#submit_confg').click(function(){
        unsavedChanges= false 
        role = $('#role').val();
        sentiment = $('#sentiment').val();
        tone = $('#tone').val();
        language=$('#language').val();
        yni_tone=$('#yni_tone').val();
        ignore_language = $('#ignore_language').prop('checked')
        ignore_yni_tone = $('#ignore_yni_tone').prop('checked')
        client.context().then(function (context) {
            subdomain = context["account"]["subdomain"];
            submitConfiguration(role, sentiment ,tone, language, ignore_language, yni_tone, ignore_yni_tone, subdomain);
            })          
    })

    $('#oauth').click(function(){
        //Calling encoded token for redirection that can only be decode by using its key value
        client.get('currentUser').then(
            function(data) {
                let user_id = data['currentUser']['id'];
                const options = {
                    url: urls.fetchUserToken,
                    type: "GET",
                    headers: {Authorization: "Bearer {{setting.token}}"},
                    secure: true,
                    autoRetry: false,
                    }
                client.request(options)
                .then((data) => {
                    let token = data['encoded_token']
                    window.open(urls.accountDash+"?id="+user_id +"&token="+token,  "_blank");
                })
        })
    })

    $('#payment_btn').click(function(){
        //Calling encoded token for redirection that can only be decode by using its key value
        client.get('currentUser').then(
            function(data) {
                let user_id = data['currentUser']['id'];
                const options = {
                    url:  urls.fetchUserToken,
                    type: "GET",
                    headers: {Authorization: "Bearer {{setting.token}}"},
                    secure: true,
                    autoRetry: false,
                    }
                client.request(options).then((data) => {
                    let token = data['encoded_token']
                    window.open(urls.accountDash+"?id="+user_id +"&token="+token,  "_blank");
                }
                ); 
        })
    })
    $('#filter_submit').click(function(){
        from_date = $('#from_date').val();
        to_date = $('#to_date').val();
        TaskTable.draw()
    })

});


function showhideTabs(tabId, tabBtnId){ 
    $('.nav-link').removeClass('active') 
    $('.tab-pane').removeClass('show active')
    $(tabId).addClass('active show')
    $(tabBtnId).addClass('active')
}

function configureAjax(subdomain){
    if (subdomain){
        url = urls.getConfigureData +subdomain
    }
    else{
        url = urls.getConfigureData
    }
    const options = {
        url:  url,
        type: "GET",
        headers: {Authorization: "Bearer {{setting.token}}"},
        secure: true,
        autoRetry: false,
    }
    client.request(options).then((data) => {
        result = JSON.parse(data)
        role = JSON.parse(result['role'])
        sentiment = JSON.parse(result['sentiment'])
        tone = JSON.parse(result['tone'])
        langauge = JSON.parse(result['language'])
        yni_tone = JSON.parse(result['yni_tone'])
        result1 = JSON.parse(result['selected_txt'])[0]
        $('#role').empty()
        $('#sentiment').empty()
        $('#tone').empty()
        $('#language').empty()
        $('#yni_tone').empty()
        $.each(role, function(index, item){
            $('#role').append(`<option value="${item.agentRoleAPI}">${item.agentRoleUI}</option>`);
        })
        $.each(sentiment, function(index, item){
            $('#sentiment').append(`<option value="${item.customerSentimentAPI}">${item.customerSentimentUI}</option>`);
        })
        $.each(tone, function(index, item){
            $('#tone').append(`<option value="${item.replyToneAPI}">${item.replyToneUI}</option>`);
        })
        $.each(langauge, function(index, item){
            $('#language').append(`<option value="${item.replylanguageAPI}">${item.replylanguageUI}</option>`);
        })
        $.each(yni_tone, function(index, item){
            $('#yni_tone').append(`<option value="${item.yniToneAPI}">${item.yniToneUI}</option>`);
        })
        try{
            $('#role').val(result1['role__agentRoleAPI'])
            $('#sentiment').val(result1['sentiment__customerSentimentAPI'])
            $('#tone').val(result1['tone__replyToneAPI'])
            $('#language').val(result1['language__replylanguageAPI'])
            $('#yni_tone').val(result1['yni_tone__yniToneAPI'])
            $('#ignore_language').prop('checked',result1['isLanguageIgnoredForInstruct'])
            $('#ignore_yni_tone').prop('checked',result1['isYniToneIgnoredForInstruct'])
        }
        catch(e){
            {}
        }
    })
}

function BillingInfo(subdomain, role){
    const options = {
        url:  urls.checkPricing +"?org_id="+subdomain +"&role="+role,
        type: "GET",
        headers: {Authorization: "Bearer {{setting.token}}"},
        secure: true,
        autoRetry: false,
    };
    client.request(options).then((data) => {
        if (data['status']=='paid'){
            $('.container-div').removeClass('d-none');
            $('.payment_btn').addClass('d-none');
        }
        else if (data['status']=='unpaid'){
            $('.container-div').addClass('d-none');
            $('.payment_btn').removeClass('d-none');
        }
    })
}


function adminAjax(subdomain){
    url = urls.getAdminData + subdomain
    const options = {
        url:  url, 
        type: "GET",
        headers: {Authorization: "Bearer {{setting.token}}"},
        secure: true,
        autoRetry: false,
    };
    client.request(options).then((data) => {
        if(data['subs'] == 'active'){
            $('.activebox').css('background','green').text(`Active`)
        }
        else if (data['subs'] == 'canceled'){
            $('.activebox').css('background','#baba18').text(`Canceled`)
        }
        else{
            $('.activebox').css('background','red').text(`Inactive`)
        }
    })
}

function submitConfiguration(role, sentiment ,tone, language, ignore_language, yni_tone, ignore_yni_tone, organization_id){
    url = urls.saveDefaultConfig
    const options = {
        url:  url,
        type: "POST",
        headers: {Authorization: "Bearer {{setting.token}}"},
        data: {"role":role, "sentiment":sentiment, "tone":tone, "language":language, "ignore_language":ignore_language, "yni_tone":yni_tone, "ignore_yni_tone":ignore_yni_tone, "organization_id":organization_id},
        secure: true,
        autoRetry: false,
    };
    client.request(options).then((data) => {
        $('#alertPopup').modal().show()
    })
}

function saveUser(user,subdomain){
    const options = {
        url:  urls.saveUser,
        type: "GET",
        headers: {Authorization: "Bearer {{setting.token}}"},
        data: { "user_id":user.id,
            "email":user.email,
            "name":user.name, 
            "role":user.role , 
            "organization_id":subdomain,
        },
        autoRetry: false,
        secure: true,
    };
    client.request(options).then((data) => {
    })
}


//Initializing serverside datatable for Activity Section, Using ajax in this because server side datatable supports ajax request. It already sents a proxy request.
function initializeProjectDataTable(role, organization_id)
{   
    let FinalTableOptions = {
        searching: true,
        processing: true,
        serverSide: true,
        stateSave: false,
        responsive: true,
        pagination:true,
        oLanguage: {
           sZeroRecords: "No data found",
           sProcessing: '<i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span>'
        },      
        columns: [
            {
                data: null,
                render: function(data, type, full, meta) {
                    return meta.row + meta.settings._iDisplayStart + 1;
                }                   
            },
            {
                data: 'date',
                searchable: true,
            },
            {
                data: 'hit_count',
                searchable: true,
            },
        ],
        ajax: {
            "url":urls.apiHitCount+"?role="+role+"&&org="+organization_id,
            "data": function (d) {
                return $.extend( {},d, {
                    "search": {'value':$('#activity_table_filter input').val(),
                    'from_date':$('#from_date').val(),
                    'to_date': $('#to_date').val()
                }
                });
            }
        }
    }
    TaskTable = $('#activity_table').DataTable(FinalTableOptions);
}

