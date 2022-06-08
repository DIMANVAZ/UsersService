//console.log('!!');

document.querySelector('.btn.btn-md.btn-primary').addEventListener('mouseover',function (){
    const emailVal = document.getElementById("form-email-input").value;
    const passVal = document.getElementById("form-password-input").value;
    console.log(emailVal, passVal);
})