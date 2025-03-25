import { server, userId, scope } from './config.js';

/* Helper Functions */

/**
 * Convert a timestamp into a formatted date string.
 * @param {string} format - The format string for the output date. 
 *                          Supported format specifiers: %y, %m, %d, %H, %M, %S.
 * @param {number} timestamp - The timestamp to convert (in milliseconds since January 1, 1970).
 * @returns {string} The formatted date string.
 */
export function formatTimestamp(format, timestamp) {
	var date = new Date(timestamp * 1000);

	// Define the replacements for each format specifier
	var replacements = {
		'%y': date.getFullYear(),
		'%m': date.getMonth() + 1, // Months are zero-based
		'%d': date.getDate(),
		'%H': date.getHours(),
		'%M': date.getMinutes(),
		'%S': date.getSeconds()
	};

	// Replace each format specifier with its corresponding value
	var formattedDate = format.replace(/%[ymdHMS]/g, function (match) {
		return replacements[match] < 10 ? '0' + replacements[match] : replacements[match];
	});

	return formattedDate;
}


/**
 * Checks if the given data has been updated within the last 24 hours, considering a daily update cycle starting at 7:00 AM.
 * @param {Object} data - The data object containing the last updated timestamp.
 * @param {boolean} weekly - If data has weekly reset instead of daily.
 * @returns {boolean} Returns true if the data is up to date.
 */
export function isUpdated(data, weekly) {
	// Get the current time
	const currentTime = new Date();

	// Get today's date at 7:00 AM
	const todayAt7AM = new Date(currentTime);
	todayAt7AM.setHours(7, 0, 0, 0);

	// Get yesterday's date at 7:00 AM
	const yesterdayAt7AM = new Date(currentTime);
	yesterdayAt7AM.setDate(yesterdayAt7AM.getDate() - 1);
	yesterdayAt7AM.setHours(7, 0, 0, 0);

	// Convert the updated timestamp to a Date object
	const lastUpdated = new Date(data.lastUpdated * 1000);

	if (weekly) {
		// Get the most recent Monday at 7:00 AM
		const mondayAt7AM = new Date(currentTime);
		const dayOfWeek = mondayAt7AM.getDay();
		const daysToSubtract = (dayOfWeek === 0) ? 6 : dayOfWeek - 1; // If it's Sunday (0), go back 6 days, else back to Monday
		mondayAt7AM.setDate(mondayAt7AM.getDate() - daysToSubtract);
		mondayAt7AM.setHours(7, 0, 0, 0);

		// If today is Monday and it's before 7:00 AM, go back to the previous Monday
		if (dayOfWeek === 1 && currentTime < mondayAt7AM) {
			mondayAt7AM.setDate(mondayAt7AM.getDate() - 7);
		}

		// Check if the last update was after the last Monday at 7:00 AM
		return lastUpdated >= mondayAt7AM && lastUpdated < currentTime;
	} else {
		// Check if the last update meets the criteria
		return (lastUpdated >= todayAt7AM && lastUpdated < currentTime) ||
			(lastUpdated >= yesterdayAt7AM && lastUpdated < todayAt7AM && currentTime.getHours() < 7);
	}
}

/**
 * Updates the specified HTML element with the last updated time based on the provided timestamp,
 * and styles the element accordingly if the data is not considered updated.
 * @param {string} element - The ID of the HTML element to update.
 * @param {string} format - The format in which the timestamp should be displayed (e.g., '%y-%m-%d %H:%M:%S').
 * @param {Object} data - The data object containing the last updated timestamp.
 */
export function createLastUpdated(element, format, data) {
	let time = formatTimestamp(format, data.lastUpdated)
	const lastUpdatedText = `Last updated at: ${time}`;

	const lastUpdatedElement = document.getElementById(element);
	lastUpdatedElement.innerText = lastUpdatedText;
	if (!isUpdated(data)) {
		lastUpdatedElement.style.color = 'red';
	}
}


/* index.html */

export function buildEndeavor(jsonData) {
	const data = jsonData[server][userId][scope].account;

	const format = '%m/%d %H:%M';
	const element = 'last_updated_endeavor';
	createLastUpdated(element, format, data);

	const endeavorContainer = document.getElementById('endeavor_container');

	function createLabel(text) {
		const label = document.createElement('label');
		label.innerHTML = text;
		endeavorContainer.appendChild(label);
		endeavorContainer.appendChild(document.createElement('br'));
	}

	// Daily endeavors
	const dailyEndeavors = data.endeavor.daily;
	const dailyCompleteCount = dailyEndeavors.filter(endeavor => endeavor.complete).length;
	if (isUpdated(data)) {
		const dailyLabelText = dailyCompleteCount === 3 ? 'Complete' : `${dailyCompleteCount}/3`;
		const dailyLabelColor = dailyCompleteCount === 3 ? 'progress-3' : `progress-${dailyCompleteCount}`;
		createLabel(`Daily Endeavors: <span class="${dailyLabelColor}">${dailyLabelText}</span>`);
	} else {
		const dailyLabelText = '0/3';
		const dailyLabelColor = 'progress-0';
		createLabel(`Daily Endeavors: <span class="${dailyLabelColor}">${dailyLabelText}</span>`);
	}

	// Weekly endeavors
	const weeklyEndeavors = data.endeavor.weekly;
	const weeklyComplete = weeklyEndeavors.some(endeavor => endeavor.complete);
	if (isUpdated(data, true)) {
		const weeklyLabelText = weeklyComplete ? 'Complete' : 'Incomplete';
		const weeklyLabelColor = weeklyComplete ? 'progress-3' : 'progress-0';
		createLabel(`Weekly Endeavors: <span class="${weeklyLabelColor}">${weeklyLabelText}</span>`);
	} else {
		const weeklyLabelText = 'Incomplete';
		const weeklyLabelColor = 'progress-0';
		createLabel(`Weekly Endeavors: <span class="${weeklyLabelColor}">${weeklyLabelText}</span>`);
	}
}

export function buildRiding(jsonData) {
	const charInfo = jsonData[server][userId][scope].account.charInfo;
	const char = jsonData[server][userId][scope].char;

	let allComplete = true;

	charInfo.forEach((character) => {
		const charId = character.charId;
		const charName = character.charName;
		const charData = char[charId];
		const updated = isUpdated(charData);

		if (!updated && charData.riding !== '-') {
			const label = document.createElement('label');
			label.textContent = `${charName}`;
			label.style.color = 'red';
			document.getElementById('riding_container').appendChild(label);
			document.getElementById('riding_container').appendChild(document.createElement('br'));
			allComplete = false;
		}
	});

	if (allComplete) {
		const label = document.createElement('label');
		label.textContent = 'Complete';
		label.style.color = 'green';
		document.getElementById('riding_container').appendChild(label);
		document.getElementById('riding_container').appendChild(document.createElement('br'));
	}
}

export function buildRewards(jsonData) {
	const data = jsonData[server];

	let allClaimed = true;
	const rewardsContainer = document.getElementById('rewards_container');
	rewardsContainer.innerHTML = '';

	Object.keys(data).forEach((id) => {
		const accountData = data[id].$AccountWide.account.dailyReward;
		const claimed = accountData.claimed;
		const updated = isUpdated(accountData);

		const label = document.createElement('label');
		label.textContent = `${id}`;
		label.style.color = (!updated || !claimed) ? 'red' : 'green';
		rewardsContainer.appendChild(label);
		rewardsContainer.appendChild(document.createElement('br'));

		if (!updated || !claimed) {
			allClaimed = false;
		}
	});

	if (allClaimed) {
		rewardsContainer.innerHTML = '';
		const label = document.createElement('label');
		label.textContent = 'Complete';
		label.style.color = 'green';
		rewardsContainer.appendChild(label);
		rewardsContainer.appendChild(document.createElement('br'));
	}
}
