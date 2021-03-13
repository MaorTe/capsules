function init() {
	if (!Array.isArray(JSON.parse(localStorage.getItem('tableData')))) {
		localStorage.setItem('tableData', JSON.stringify([]));
		getUsers();
		setTimeout(() => {
			const tableData = renderData();
			localStorage.setItem(`tableData`, JSON.stringify(tableData));
		}, 10000);
	}
}

const container = document.querySelector('.container');
//get users from API
const getUsers = async () => {
	const users = await fetch('https://apple-seeds.herokuapp.com/api/users/');
	const response = await users.json();

	const tableData = JSON.parse(localStorage.getItem('tableData'));
	for (let i = 0; i < 32; i++) {
		const extra = await fetch(
			`https://apple-seeds.herokuapp.com/api/users/${i}`
		);
		const responseExtra = await extra.json();
		tableData[i] = { ...response[i], ...responseExtra };
	}
	localStorage.setItem(`tableData`, JSON.stringify(tableData));
};

const tableBody = document.querySelector('.tableBody');
// render data (read)
const renderData = (filtered) => {
	tableBody.innerHTML = '';
	const tableData = filtered
		? filtered
		: JSON.parse(localStorage.getItem('tableData'));
	// setting table body
	tableData.forEach((person) => {
		const tableHtml = `<tbody>
			<tr>
				<td>${person.id}</td>
				<td><input class="person-info" type="text" disabled value="${
					person.firstName
				}" size="${person.firstName.length}"/></td>
				<td><input class="person-info" type="text" disabled value="${
					person.lastName
				}" size="${person.lastName.length}"/></td>

				<td><input class="person-info" type="text" disabled value="${person.capsule}" 
				size="${person.capsule.toString().length}
				" pattern="\d*" maxlength="2"/></td>
				
				<td><input class="person-info" type="text" disabled value="${
					person.age
				}" size="${person.age.toString().length}"
				pattern="\d*" maxlength="3"/></td>

				<td><input class="person-info" type="text" disabled value="${
					person.city
				}" size="${person.city.length}"/></td>
				<td><input class="person-info" type="text" disabled value="${
					person.gender
				}" size="${person.gender.length}"/></td>
				<td><input class="person-info" type="text" disabled value="${
					person.hobby
				}" size="${person.hobby.length}"/></td>

				<td><button class="item-edit edit-btn" data-update>
					edit
					</button>
				</td>
				<td><button class="item-delete delete-btn" data-delete>
					delete
					</button>
				</td>
			</tr>
		</tbody>`;

		tableBody.innerHTML += tableHtml;
	});
	deleteOrConfirmEventListener();
	editOrCancelEventListener();
	return tableData;
};

// async function print() {
// 	console.log(await getUsers());
// }
// function makeTable() {
// 	let table = document.querySelector('table'),
// 		ths = table.querySelectorAll('thead th'),
// 		row = table.querySelectorAll('tbody tr'),
// 		tBody = table.querySelector('tbody'),
// 		docF = document.createDocumentFragment();

// 	function sortMe(e) {
// 		let thsArray = [].slice.call(ths),
// 			rowArray = [].slice.call(row),
// 			target = e.target,
// 			thsIndex = thsArray.indexOf(target);

// 		rowArray.sort(function (a, b) {
// 			let tdA = a.children[thsIndex].textContent,
// 				tdB = b.children[thsIndex].textContent;

// 			if (tdA > tdB) {
// 				return 1;
// 			} else if (tdA < tdB) {
// 				return -1;
// 			} else {
// 				return 0;
// 			}
// 		});

// 		rowArray.forEach(function (row) {
// 			docF.appendChild(row);
// 		});

// 		tBody.appendChild(docF);
// 	}

// 	for (let i = 0; i < ths.length; i++) {
// 		ths[i].addEventListener('click', sortMe, false);
// 	}
// }
// makeTable();
//-------------event listeners-------------
//delete
const deleteOrConfirmEventListener = () => {
	const row = document.querySelectorAll('tbody [data-delete]');
	row.forEach((el, index) => {
		el.addEventListener('click', () => {
			el.textContent === 'delete'
				? deletePerson(index)
				: confirmPerson(el, index);
		});
	});

	function deletePerson(index) {
		const tableData = JSON.parse(localStorage.getItem('tableData'));
		tableData.splice(index, 1);
		tableData.forEach((person, index) => {
			person.id = index;
		});
		localStorage.setItem('tableData', JSON.stringify(tableData));
		renderData();
	}

	function confirmPerson(el, index) {
		const tableData = JSON.parse(localStorage.getItem('tableData'));

		//insert the new data into localStorage
		Object.keys(tableData[index]).forEach((key, i) => {
			if (i === 0) return;
			const childInput = el.parentElement.parentElement.children[i].children[0];
			tableData[index][key] = childInput.value;
			childInput.disabled = true;
		});
		localStorage.setItem('tableData', JSON.stringify(tableData));

		//replace previous style of cancel button to edit
		el.classList.remove('confirm-btn');
		el.classList.add('delete-btn');
		el.textContent = 'delete';
		//replace previous style of delete button to confirm
		const editButton = el.parentElement.previousElementSibling.firstChild;
		editButton.classList.remove('cancel-btn');
		editButton.classList.add('edit-btn');
		editButton.textContent = 'edit';
	}
};

//update
const editOrCancelEventListener = () => {
	const rowUpdate = document.querySelectorAll('tbody [data-update]');
	rowUpdate.forEach((el, index) => {
		el.addEventListener('click', () => {
			const currentPerson =
				el.parentElement.parentElement.children[1].children[0];
			console.log(el.parentElement.parentElement.childNodes);
			currentPerson.focus();
			updateItem(el, currentPerson, index);
		});
	});

	function updateItem(el, currentPerson, index) {
		//replace style of edit button to cancel
		el.classList.remove('edit-btn');
		el.classList.add('cancel-btn');
		el.textContent = 'cancel';

		//replace style of delete button to confirm
		const deleteButton = el.parentElement.nextElementSibling.firstChild;
		deleteButton.classList.remove('delete-btn');
		deleteButton.classList.add('confirm-btn');
		deleteButton.textContent = 'confirm';

		//row inputs enabling or disabling each input upon event button clicked
		let isFocused = document.activeElement === currentPerson;
		if (!isFocused) {
			for (let i = 1; i <= 7; i++) {
				el.parentElement.parentElement.children[i].children[0].disabled = false;
			}
			currentPerson.focus();
		} else {
			//replace previous style of cancel button to edit
			el.classList.remove('cancel-btn');
			el.classList.add('edit-btn');
			el.textContent = 'edit';
			//replace previous style of delete button to confirm
			deleteButton.classList.remove('confirm-btn');
			deleteButton.classList.add('delete-btn');
			deleteButton.textContent = 'delete';

			const tableData = JSON.parse(localStorage.getItem('tableData'));
			for (let i = 1; i <= 7; i++) {
				const child = el.parentElement.parentElement.children[i].children[0];
				child.disabled = true;
				child.value = Object.values(tableData[index])[i];
				localStorage.setItem('tableData', JSON.stringify(tableData));
			}
		}
	}
};

const searchInput = document.querySelector('[data-search]');
searchInput.addEventListener('keyup', (e) => {
	const tableData = JSON.parse(localStorage.getItem('tableData'));
	const selectedDropDownValue = document.querySelector('.persons').value;
	const searchString = e.target.value;
	const filteredCharacters = tableData.filter((character, i) => {
		return (
			character[selectedDropDownValue].toLowerCase().includes(searchString) && i
		);
	});
	renderData(filteredCharacters);
});

init();
renderData();
