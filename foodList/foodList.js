// Read JSON File and Create Element with data
$(document).ready(function () {
    $.getJSON("StreetFoodData.json", function (data) {
        $.each(data, function (index, item) {
            let imageName = item.name.replaceAll(" ", "");
            let foodName = imageName.toLowerCase()
            let countryName = item.country.replaceAll(" ", "");

            let htmlContent = '<div class="card shadow-sm m-2 ' + countryName + '" id="'+ foodName +'" style="width:18rem;">';
            htmlContent += '<img class="card-img-top" src="../image/' + imageName + '.jpg" alt="' + item.name + '">';
            htmlContent += '<div class="card-body">';
            htmlContent += '<h5 class="card-title">' + item.name + '</h5>';
            htmlContent += '<p class="card-text">' + item.description + '</p>';
            htmlContent += '<p class="card-text"><small class="text-body-secondary">' + item.country + '</small></p></div></div>';
            $('#foodContent').append(htmlContent);
        });
    });
})

function filterAndSearch(event) {
    // Remain user's input 
    event.preventDefault();

    // Get value
    let allFood = document.getElementById("foodContent").childNodes;
    let country = document.getElementById("country").value;
    let searchName = document.getElementById("searchFood").value.replaceAll(" ", "").toLowerCase();

    console.log(searchName);

    // Hide all food list
    allFood.forEach(function (item, index) {
        item.style.display = 'none';
    })

    // Search String 
    if (searchName == "" && country == "allCountries") {
        allFood.forEach(function (item, index) {
            item.style.display = 'inline';
        })
    }
    else {
        if (searchName == "") {
            allFood.forEach(function (item, index) {
                if (item.className.includes(country)) {
                    item.style.display = 'inline';
                }
            })
        }

        if (country == "allCountries") {
            allFood.forEach(function (item, index) {
                if (item.id.includes(searchName)) {
                    item.style.display = 'inline';
                }
            })
        }

        if (searchName != "" && country != "allCountries") {
            allFood.forEach(function (item, index) {
                if (item.className.includes(country) && item.id.includes(searchName)) {
                    item.style.display = 'inline';
                }
            })
        }

    }
}

