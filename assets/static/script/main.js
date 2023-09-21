
let client = ZAFClient.init();
let subdomain = undefined;
let user = undefined;
let last_ticket_msg = "";

(function () {
    client.invoke("resize", { width: "460px", height: "31px" }); 
    client.get('currentUser').then(
        function(data) {
          user = data['currentUser'];
          client.context().then(function (context) {
            subdomain = context["account"]["subdomain"];
            saveUser(user, subdomain);
          })
        if (user['role'] !== 'admin'){
            client.get('appsTray.isVisible')
            client.get('currentUser.admin');
            client.invoke('appsTray.hide')
        }
        }
      );
  })();
    client.on('pane.activated', function() {
        client.invoke("resize", { width: "460px", height: "31px" });
        client.get('ticket.conversation')
        .then(function(data) {
            var conversation = data['ticket.conversation'].reverse();
            $.each(conversation, function(index, item){
                if(item.channel.name != 'internal'){
                    last_ticket_msg = $('<div>').html(item.message.content).text();
                    return false;
                }
            })
        }).catch(function(error) {
            last_ticket_msg = "No Comment"
        });  
        saveUser(user, subdomain);
        $('.container').addClass('d-none');
        $('.options-container').removeClass('d-none');
        $('#topside-txt').removeClass('d-none');
        $('form').removeClass('d-none');
        $('#response_content').addClass('d-none');
        $('#change_condition_div').addClass('d-none');
    });


$(document).ready(function(){
    $('.reword').click(function(){
        fetchConfigData(user, subdomain)
        client.invoke("resize", { width: "500", height: "600px" });
        $('.container').removeClass('d-none')
        $('.options-container').addClass('d-none')
    })
    $('.yes').click(function(){
        client.get("ticket.conversation").then(
            function(data) {
                if (last_ticket_msg !== "" ){
                    sendYesResponse(last_ticket_msg, subdomain)
                }
                else{
                    sendYesResponse('No Comment')
                }
            }
        )
    })
    $('.no').click(function(){
        client.get("ticket.conversation").then(
            function(data) {
                if (last_ticket_msg !== ""){
                    sendNoResponse(last_ticket_msg, subdomain)
                }
                else{
                    sendNoResponse('No Comment')
                }
            }
        )
    })
    $('.instruct').click(function(){
        client.get("ticket.conversation").then(
            function(data) {
                if (last_ticket_msg !== "" ){
                    client.get('ticket.comment').then(
                        function(data) {
                            var comment = data['ticket.comment'];
                            sendInstructResponse(last_ticket_msg , comment.text, subdomain)                        
                        })
                }
                else{
                    sendInstructResponse('No Comment')
                }
            }
        )
    })
    $('.more_info').click(function(){
        client.get("ticket.conversation").then(
            function(data) {
                if (last_ticket_msg !== "" ){
                    sendMoreInfoResponse(last_ticket_msg , subdomain)
                }
                else{
                    sendMoreInfoResponse('No Comment')
                }
            }
        )
    })
})

let textarea_txt = ""
function askAI() {
    var role = $('#role').val();
    var sentiment = $('#sentiment').val();
    var tone = $('#tone').val();
    $('#topside-txt').addClass('d-none')
    $('form').addClass('d-none')
    client.get('ticket.comment').then(
    function(data) {
        var comment = data['ticket.comment'];
        $('#text_content').html('').attr('contenteditable', false)
        if ((comment.text).length === 0){
            openai_test(subdomain, 'No Comment' , role, sentiment, tone)
        }
        else{
            openai_test(subdomain, comment.text , role, sentiment, tone)
        }                  
    });
}


function acceptAbove() {
    response = $('#text_content').html();
    client.set('ticket.comment.text', [response])
    client.invoke('app.close')
};


function closePopup() {
    client.invoke('app.close')
}

function changeCondition(){
    $('form').removeClass('d-none');
    $('#topside-txt').removeClass('d-none');
    $('#response_content').addClass('d-none');
    $('#change_condition_div').addClass('d-none');
}

function openai_test(subdomain, text, role, sentiment, tone) {
    textarea_txt = text
    if (textarea_txt === 'No Comment'){
        $('#text_content').html('')
        $('#fixed_loading').addClass('d-none')
        $('#change_condition_div').removeClass('d-none')
        $('#response_content').removeClass('d-none')
        $('#text_content').html("Hey there! I'm sorry, but I don't have any comment at the moment in textbox. Is there anything else that I can help you with?")
    }
    else{
        $('#fixed_loading').removeClass('d-none');
        const options = {
            url:  urls.getResponse,
            type: "POST",
            headers: {Authorization: "Bearer {{setting.token}}"},
            data: {"organization_id":subdomain,"role":role,"sentiment":sentiment,"tone":tone, "prompt_txt":text,"email":user.email},
            secure: true,
            autoRetry: false,
        };
        client.request(options)
        .then((data) => {
            $('#text_content').html('')
            $('#fixed_loading').addClass('d-none')
            $('#change_condition_div').removeClass('d-none')
            $('#response_content').removeClass('d-none')
            $('#text_content').html(data.replaceAll('\n','<br>'))
            if (data !== "Sorry, AI is currently unable to generate content. Please try again later."){
                countAPIHit(user, subdomain,text);
            }
        })
        .catch((error) => {
            $('#fixed_loading').addClass('d-none');
        });
    }

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

function countAPIHit(user ,subdomain, prompt_txt){
    const options = {
        url:  urls.countAPIHit,
        type: "GET",
        headers: {Authorization: "Bearer {{setting.token}}"},
        data: { "user_id":user.id,
                "email":user.email,
                "name":user.name, 
                "role":user.role , 
                "organization_id":subdomain,
                "prompt_txt":prompt_txt
        },
        secure: true,
        autoRetry: false,
      };
      client.request(options).then((data) => {
      })    
}

function fetchConfigData(user,subdomain){
    url = urls.getConfigureData +subdomain
    const options = {
        url: url,
        type: "GET",
        headers: {Authorization: "Bearer {{setting.token}}"},
        secure: true,
        autoRetry: false,
        };
        client.request(options)
        .then((data) => {
            result = JSON.parse(data)
            role = JSON.parse(result['role'])
            sentiment = JSON.parse(result['sentiment'])
            tone = JSON.parse(result['tone'])
            result1 = JSON.parse(result['selected_txt'])[0]
            $('#role').empty()
            $('#sentiment').empty()
            $('#tone').empty()
            $.each(role, function(index, item){
                $('#role').append(`<option value="${item.agentRoleAPI}">${item.agentRoleUI}</option>`);
            })
            $.each(sentiment, function(index, item){
                $('#sentiment').append(`<option value="${item.customerSentimentAPI}">${item.customerSentimentUI}</option>`);
            })
            $.each(tone, function(index, item){
                $('#tone').append(`<option value="${item.replyToneAPI}">${item.replyToneUI}</option>`);
            })
            try{
                $('#role').val(result1['role__agentRoleAPI'])
                $('#sentiment').val(result1['sentiment__customerSentimentAPI'])
                $('#tone').val(result1['tone__replyToneAPI'])
            }
            catch(e){
                throw new Error('Something went wrong, Please try again.');
            }
      })
      .catch((error) => {
        $('#fixed_loading_1').addClass('d-none');
      });
      
}



function sendYesResponse(response, org_id){
    if (response == 'No Comment'){
        client.set('ticket.comment.text',"There is no comment to respond 'yes', as there has been no previous comment from the user.")
        client.invoke('app.close')
    }
    else{
        $('#fixed_loading_1').removeClass('d-none');
        const options = {
            url:  urls.getYesResponse,
            type: "POST",
            headers: {Authorization: "Bearer {{setting.token}}"},
            data: {"prompt_txt":response,"organization_id":org_id,"email":user.email,"phase2":true},
            secure: true,
            autoRetry: false,
        };
        client.request(options)
        .then((data) => {
            $('#fixed_loading_1').addClass('d-none');
            client.set('ticket.comment.text', [data])
            client.invoke('app.close')
            if (data !== "Sorry, AI is currently unable to generate content. Please try again later."){
                countAPIHit(user, subdomain,response);
            }
        })
        .catch((error) => {
            $('#fixed_loading_1').addClass('d-none');
          });
}
}

function sendNoResponse(response,org_id){
    if (response == 'No Comment'){
        client.set('ticket.comment.text',"There is no comment to respond 'No', as there has been no previous comment from the user.")
        client.invoke('app.close')
    }
    else{
        $('#fixed_loading_1').removeClass('d-none');
        const options = {
            url:  urls.getNoResponse,
            type: "POST",
            headers: {Authorization: "Bearer {{setting.token}}"},
            data: {"prompt_txt":response,"organization_id":org_id,"email":user.email,"phase2":true},
            secure: true,
            cors:false,
            autoRetry: false,
        };
        client.request(options)
        .then((data) => {
            $('#fixed_loading_1').addClass('d-none');
            client.set('ticket.comment.text', [data])
                client.invoke('app.close')
                if (data !== "Sorry, AI is currently unable to generate content. Please try again later."){
                    countAPIHit(user, subdomain,response);
            }
        })
        .catch((error) => {
            $('#fixed_loading_1').addClass('d-none');
          });
    }
}

function sendInstructResponse(response,agent_response,org_id){
    if (response == 'No Comment'){
        client.set('ticket.comment.text',"There is no comment to respond 'Instruct', as there has been no previous comment from the user.")
        client.invoke('app.close')
    }
    else{
        $('#fixed_loading_1').removeClass('d-none');
        const options = {
            url:  urls.getInstructResponse,
            type: "POST",
            headers: {Authorization: "Bearer {{setting.token}}"},
            data: {"prompt_txt":response,"agent_response":agent_response,"organization_id":org_id,"email":user.email,"phase2":true},
            secure: true,
            autoRetry: false,
        };
        client.request(options)
        .then((data) => {
            $('#fixed_loading_1').addClass('d-none');
            client.set('ticket.comment.text', [data])
            client.invoke('app.close')
            if (data !== "Sorry, AI is currently unable to generate content. Please try again later."){
                countAPIHit(user, subdomain,response);
            }
        })
        .catch((error) => {
            $('#fixed_loading_1').addClass('d-none');
          });
    }
}

function sendMoreInfoResponse(response,org_id){
    if (response == 'No Comment'){
        client.set('ticket.comment.text',"There is no comment to respond 'More Info/Question', as there has been no previous comment from the user.")
        client.invoke('app.close')
    }
    else{
        $('#fixed_loading_1').removeClass('d-none');
        const options = {
            url:  urls.getMoreInfoResponse,
            type: "POST",
            headers: {Authorization: "Bearer {{setting.token}}"},
            data: {"prompt_txt":response,"organization_id":org_id,"email":user.email,"phase2":true},
            secure: true,
            autoRetry: false,
        };
        client.request(options)
        .then((data) => {
            $('#fixed_loading_1').addClass('d-none');
            client.set('ticket.comment.text', [data])
            client.invoke('app.close')
            if (data !== "Sorry, AI is currently unable to generate content. Please try again later."){
                countAPIHit(user, subdomain,response);
            }
        })
        .catch((error) => {
            $('#fixed_loading_1').addClass('d-none');
          });
        
    }
}