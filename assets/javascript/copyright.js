var creator = "H. Spratt" // change this line as needed!
var startYear = 2017; // change this line as needed!
var d = new Date();
var thisYear = d.getFullYear();
var yearText = "" + startYear;
if (thisYear > startYear) {
	yearText = yearText + " - " + thisYear;
}
var element = document.getElementById("copyright");
element.innerHTML = "Copyright &#169; " + yearText + " " + creator;
