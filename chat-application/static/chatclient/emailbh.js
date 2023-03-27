var shown = false;
function showhideEmail1(){
    if(shown){
        document.getElementById('emailbh').innerHTML = "Show my Email";
        shown = false;
    }else{
        var myemail = "<a href= 'mailto: tallapanenib1"+ "@" + "udayton.edu'>tallapanenib1" + "@" +"udayton.edu</a>";
        document.getElementById('emailbh').innerHTML= myemail;
        shown = true;
    }
}