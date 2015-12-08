jQuery(document).ready(function($){

    var algSelector = [];

    document.getElementById('algChoose').onclick = function(){
        document.getElementById('step1').style.display = 'none';
        document.getElementById('step2').style.display = 'flex';
    }

    document.getElementById('add').onclick = function(){
        var select = document.getElementById('selAlg');
        if(select.value != ''){
            if(algSelector.length == 0){
                var remalg = document.getElementById('remalg1');
                remalg.removeChild(remalg.firstChild);
                remalg.className = 'some'
            }
            algSelector.push(select.value);

            var p0 = document.createElement('p');
            p0.innerHTML = algSelector.length + '.';
            var p = document.createElement('p');
            p.innerHTML = select.value + '';
            p.className = 'pAlg';
            var button = document.createElement('button');
            button.value = algSelector.length;
            button.className = 'button remove';
            button.innerHTML = 'Remove'
            button.onclick = function (){
                removeAlg(button.value, algSelector);
            }

            document.getElementById('remalg0').appendChild(p0);
            document.getElementById('remalg1').appendChild(p);
            document.getElementById('remalg2').appendChild(button);

            select.remove(select.selectedIndex);
            document.getElementById('algChoose').removeAttribute('disabled');

        }

    }

    document.getElementById('start').onclick = function(){
        document.getElementById('step0').style.display = 'none';
        document.getElementById('step1').style.display = 'flex';
    }

    document.getElementById('uploadNext').onclick = function(){
        document.getElementById('step2').style.display = 'none';
        document.getElementById('step3').style.display = 'flex';
    }

    document.getElementById('testChoose').onclick = function() {
        document.getElementById('step3').style.display = 'none';
        document.getElementById('step4').style.display = 'flex';
    }

    $('#trainButton').click(function(){ 
        if($('#trainInput').val() !== ''){ 
            $('#uploadTrain').submit(uploadTrain(algSelector));
        }
    })

    $('#testButton').click(function(){ 
        if($('#testInput').val() !== ''){ 
            $('#uploadTest').submit(uploadTest());
        }
    })

    function uploadTest(){

        var val = algSelector;

        $('#uploadTest').ajaxSubmit({
            error: function(xhr) {
              console.log('Error: ' + xhr.status);
            },

            success: function(response) {
                if(response.error){
                    console.log("submit2");
                    console.log("Nope");
                    return;
                }
                document.getElementById('testButton').setAttribute('disabled', 'disabled');
                var step3 = document.getElementById('step3');
                var successP = document.createElement('h3');
                successP.innerHTML = 'Uploaded Successfully';
                
                var createRes = document.getElementById('createRes');
                createRes.removeAttribute('disabled');

                var nextButton = document.getElementById('testChoose');
                var step4 = document.getElementById('step4');

                createRes.onclick = function(){
                    createRes.setAttribute('disabled', 'disabled');
                    var success = val.length;
                    for(var i = 0; i < val.length; i++){
                        $.post('/testmodel', { algorithms : val[i] }, function(data){
                            success--;
                            console.log(data);
                            var resHeader = document.createElement('h5');
                            resHeader.innerHTML = data.message;
                            var resText = document.createElement('iframe');
                            resText.src = data.resStdOut;

                            step4.appendChild(resHeader);
                            step4.appendChild(resText);

                            if(success == 0){
                                var successM = document.createElement('h3');
                                successM.innerHTML = 'Output Created';
                                step3.insertBefore(successM , nextButton);
                                nextButton.removeAttribute('disabled');
                            }
                        });
                    }
                }
                step3.insertBefore(successP, createRes);

                return;
            }
        });

        // Have to stop the form from submitting and causing                                                                                                       
        // a page refresh - don't forget this                                                                                                                      
        return false;
    };

});

function removeAlg(val, algSelector){
    var remalg0 = document.getElementById('remalg0');
    while(remalg0.firstChild){
        remalg0.removeChild(remalg0.firstChild)
    }
    var remalg1 = document.getElementById('remalg1');
    while(remalg1.firstChild){
        remalg1.removeChild(remalg1.firstChild)
    }
    var remalg2 = document.getElementById('remalg2');
    while(remalg2.firstChild){
        remalg2.removeChild(remalg2.firstChild)
    }

    for(var i = 0; i < algSelector.length; i++){
        if(i != val - 1){
            algSelector.push(algSelector.shift());
        }
        else{
            var addSelect = algSelector.shift();
            var addOption = document.createElement('option');
            addOption.value = addSelect;
            addOption.innerHTML = addSelect;
            document.getElementById('selAlg').add(addOption);
        }
    }

    if(algSelector.length == 0){
        var p = document.createElement('p');
        p.innerHTML = '(none)';
        remalg1.className = 'none'
        remalg1.appendChild(p);
        document.getElementById('algChoose').setAttribute('disabled', 'disabled');
    }
    else{
        for(var i = 0; i < algSelector.length; i++){
            var num = document.createElement('p');
            num.innerHTML = (i + 1) + '';
            var alg = document.createElement('p');
            alg.innerHTML = algSelector[i] + '';
            alg.className = 'pAlg';
            var button = document.createElement('button');
            button.value = algSelector.length;
            button.className = 'button remove';
            button.innerHTML = 'Remove'
            button.onclick = function (){
                removeAlg(button.value, algSelector);
            }
            remalg0.appendChild(num);
            remalg1.appendChild(alg);
            remalg2.appendChild(button);
        }
    }
}

function uploadTrain(val){

    $('#uploadTrain').ajaxSubmit({
        error: function(xhr) {
          console.log('Error: ' + xhr.status);
        },

        success: function(response) {
            if(response.error){
                console.log("Nope");
                return;
            }
            document.getElementById('trainButton').setAttribute('disabled', 'disabled');
            var step2 = document.getElementById('step2');
            var successP = document.createElement('h3');
            successP.innerHTML = 'Uploaded Successfully';

            var nextButton = document.getElementById('uploadNext');

            var createModel = document.createElement('button');
            createModel.className = 'button';
            createModel.innerHTML = "Create Model";
            createModel.onclick = function(){
                createModel.setAttribute('disabled', 'disabled');
                var success = val.length;
                for(var i = 0; i < val.length; i++){
                    $.post('/model', { algorithms : val[i] }, function(data){
                        success--;
                        console.log('Model success');
                        if(success == 0){
                            var successM = document.createElement('h3');
                            successM.innerHTML = 'Model Created';
                            step2.insertBefore(successM , nextButton);
                            nextButton.removeAttribute('disabled');
                        }
                    });
                }
            }

            step2.insertBefore(successP, nextButton);
            step2.insertBefore(createModel, nextButton);

            return;
        }
    });

    // Have to stop the form from submitting and causing                                                                                                       
    // a page refresh - don't forget this                                                                                                                      
    return false;
};


