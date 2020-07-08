
const formSearch = document.querySelector('.form-search'),
  inputCitiesFrom = formSearch.querySelector('.input__cities-from'),
  dropdownCitiesFrom = formSearch.querySelector('.dropdown__cities-from'),
  inputCitiesTo = formSearch.querySelector('.input__cities-to'),
  dropdownCitiesTo = formSearch.querySelector('.dropdown__cities-to'),
  inputDateDepart = formSearch.querySelector('.input__date-depart'),
  cheapestTicket = document.getElementById('cheapest-ticket'),
  otherCheapTickets = document.getElementById('other-cheap-tickets');

const citiesApi = 'http://api.travelpayouts.com/data/ru/cities.json',
  proxy = 'https://cors-anywhere.herokuapp.com/',
  API_KEY = '0fbf415a52c82191f3ce5fd7f9de3d47',
  calendar = 'http://min-prices.aviasales.ru/calendar_preload',
  MAX_COUNT = 10;

let city = [];

const getData = (url, callBack, reject = console.error) => {

  try {

  const request = new XMLHttpRequest();

  request.open('GET', url); //какой запроc и передаем url

  request.addEventListener('readystatechange', () => {
    if (request.readyState !== 4) return; // ответ 4, далее проверяем его 

    if(request.status === 200) { //проверка
      callBack(request.response);
    } else {
       reject(request.status);
    }
  });
    request.send(); 
  } catch(e) {
    console.log(e)
  }
  
};


const showCity = (input, list) => {
  list.textContent = '';

  if (input.value !== '') {

    const filterCity = city.filter((item) => {  
      const fixItem = item.name.toLowerCase();
      return fixItem.startsWith(input.value.toLowerCase());  
    });

    filterCity.forEach((item) => {
      const li = document.createElement('li');
      li.classList.add('dropdown__city');
      li.textContent = item.name;
      list.append(li)
    });
  }
};

const selectCity = (event, input, list) => {
  const target = (event.target);
  if (target.tagName.toLowerCase() === 'li') {
    input.value = target.textContent;
    list.textContent = '';
  }
};

const getNameCity = (code) => {
  const objCity = city.find((item) => item.code === code);
  return objCity.name; 
  console.log(objCity);
};

const getDate = (date) => {
  return new Date(date).toLocaleString('ru', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

};

const getChanges = (num) => {
  if (num) {
    return num === 1 ? 'С одоной переадкой' : 'С двумя пересадками';
  } else {
    return 'Без пересадок'
  }
};

const getLinkAviasales = (data) => {
  let link = 'https://www.aviasales.ru/search/';

  link += data.origin;

  const date = new Date(data.depart_date);

  const day = date.getDate();

  link += day < 10 ? '0' + day : day;

  const month = date.getMonth() + 1;

  link += month < 10 ? '0' + month : month;

  link += data.destination;

  return link + 1;
};

const createCard = (data) => {
  const ticket = document.createElement('article');
  ticket.classList.add('ticket');

  let deep = '';

  if (data) {
    deep = `
    <h3 class="agent">${data.gate}</h3>
    <div class="ticket__wrapper">
      <div class="left-side">
        <a href="${getLinkAviasales(data)}" target="_blank" class="button button__buy">Купить
          за ${data.value}₽</a>
      </div>
      <div class="right-side">
        <div class="block-left">
          <div class="city__from">Вылет из города
            <span class="city__name">${getNameCity(data.origin)}</span>
          </div>
          <div class="date">${getDate(data.depart_date)}</div>
        </div>

        <div class="block-right">
          <div class="changes">${getChanges(data.number_of_changes)}</div>
          <div class="city__to">Город назначения:
            <span class="city__name">${getNameCity(data.destination)}</span>
          </div>
        </div>
      </div>
    </div>
    `;
  } else {
    deep = '<h3>К сожалению на текущую дату билетов нет!</h3>'
  }

  ticket.insertAdjacentHTML('afterbegin', deep);

  return ticket;
};

const renderCheapDay = (cheapTicket) => {
  cheapestTicket.style.display = 'block';
  cheapestTicket.innerHTML = '<h2>Самый дешевый билет на выбранную дату</h2>';

  const ticket = createCard(cheapTicket[0]);
  cheapestTicket.append(ticket);
};

const renderCheapYear = (cheapTickets) => {
  otherCheapTickets.style.display = 'block';
  otherCheapTickets.innerHTML = '<h2>Самый дешевый билет на другие даты</h2>';

  cheapTickets.sort((a, b) => {
    if(a.value > b.value) {
      return 1;
    }
    if (a.value < b.value) {
      return -1;
    }
    return 0;
  });

  for(let i = 0; i < cheapestTickets.length && i < MAX_COUNT; i++) {
    const ticket = createCard(cheapTickets[i]);
    otherCheapTickets.append(ticket);
  }

  console.log(cheapTickets);
};  

const renderCheap = (data, date) => {
  const cheapTicketYear = JSON.parse(data).best_prices;

  const cheapTicketDay = cheapTicketYear.filter((item) => {
    return item.depart_date === date
  });
  renderCheapDay(cheapTicketDay);
  renderCheapYear(cheapTicketYear);
};





//обработчик событий

inputCitiesFrom.addEventListener('input', () => {
  showCity(inputCitiesFrom, dropdownCitiesFrom)
});

inputCitiesTo.addEventListener('input', () => {
  showCity(inputCitiesTo, dropdownCitiesTo);
})

dropdownCitiesFrom.addEventListener('click', () => {
  selectCity(event, inputCitiesFrom, dropdownCitiesFrom);
});

dropdownCitiesTo.addEventListener('click', () => {
  selectCity(event, inputCitiesTo, dropdownCitiesTo);
});

formSearch.addEventListener('submit', (event) => {
   event.preventDefault();

  const cityFrom = city.find((item) => inputCitiesFrom.value === item.name);
  const cityTo = city.find((item) => inputCitiesTo.value === item.name)

   const formData = {
     from: cityFrom,
     to: cityTo,
     when: inputDateDepart.value,
   };

  if (formData.from && formData.to) { 
    //  const requestData = `?depart_date=${formData.when}&origin=${formData.fron}&destination=${formData.to}&one_way=true`;

    const requestData = '?depart_date=' + formData.when +
    '&origin=' + formData.from.code +
    '&destination=' + formData.to.code +
    '&one_way=true&token=' + API_KEY;  // get запрос

    getData(calendar + requestData, (response) => {
      renderCheap(response, formData.when)
    }, error => {
      alert('На это направление не найдено билетов!');
      console.error('Ошибка:', error)
    });
  } else {
    alert('Введите корректное название города');
  }
});

//вызовы функций

getData(proxy + citiesApi, (data) => {
  city = JSON.parse(data).filter(item => item.name);
  city.sort((a, b) => {
    if (a.name > b.name) {
      return 1;
    }
    if (a.name < b.name) {
      return -1;
    }
    return 0;
  });
});





// inputCitiesTo.addEventListener('input', () => {
//   dropdownCitiesTo.textContent = '';

//   if (dropdownCitiesTo.value !== '') {
//     const filterCity = city.filter((item) => {
//       const fixItem = item.toLocaleLowerCase();
//       return fixItem.includes(inputCitiesTo.value.toLocaleLowerCase());
//     });

//     filterCity.forEach((item) => {
//       const li = document.createElement('li');
//       li.classList.add('dropdown__city');
//       li.textContent = item;
//       dropdownCitiesTo.append(li);
//     });
//   } 
// });

// dropdownCitiesTo.addEventListener('input', () => {
//   const target = (event.target);
//   if (target.tagName.toLocaleLowerCase() === 'li') {
//     inputCitiesTo.value = target.textContent;
//     dropdownCitiesTo.textContent = '';
//   }
// });






 