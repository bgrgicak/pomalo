export const parentView = {
	name: 'parent',
	views: {
		'duration': {
			map: (function (document) {
				const parent = document.parent;
				// TODO use real date
				let start = (new Date().getTime());
				let end = document.dueDate
					? document.dueDate
					: (start + 604800000); // 7 days
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