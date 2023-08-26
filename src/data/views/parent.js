export const parentView = {
	name: 'parent',
	views: {
		'duration': {
			map: (function (document) {
				const SEVEN_DAYS = 604800000;
				const parent = document.parent;
				let start = document.startDate;
				let end = document.dueDate;
				if (start > end) {
					start = end - SEVEN_DAYS;
				}
				if (0 !== document.events.length) {
					document.events.forEach(event => {
						if (!start || event.start < start) {
							start = event.start;
						}
						if (!end || event.end && event.end > end) {
							end = event.end;
						}
					});
				}
				if (!start) {
					start = (new Date()).getTime();
				}
				if (!end) {
					end = start + SEVEN_DAYS;
				}
				emit(
					[document.type, parent, start, end, document._id],
					{
						start,
						end,
					}
				);
			}).toString()
		}
	},
};