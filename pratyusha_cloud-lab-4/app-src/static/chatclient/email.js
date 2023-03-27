var shown = false;
function showhideEmail(){
    if(shown){
        document.getElementById('email').innerHTML = "Show my Email";
        shown = false;
    }else{
        var myemail = "<a href= 'mailto: thamminenip1"+ "@" + "udayton.edu'>thamminenip1" + "@" +"udayton.edu</a>";
        document.getElementById('email').innerHTML= myemail;
        shown = true;
    }
}