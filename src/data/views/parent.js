export const parentView = {
	name: 'parent',
	views: {
		'duration': {
			map: (function (document) {
				const SEVEN_DAYS = 604800000;
				const parent = document.parent;
				let start = document.startDate
					? document.startDate
					: (new Date().getTime());
				let end = document.dueDate
					? document.dueDate
					: (start + SEVEN_DAYS);
				if (start > end) {
					start = end - SEVEN_DAYS;
				}
				if (0 !== document.events.length) {
					document.events.forEach(event => {
						if (event.start < start) {
							start = event.start;
						}
						if (event.end && event.end > end) {
							end = event.end;
						}
					});
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