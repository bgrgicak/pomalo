export const priorityView = {
	name: 'priority',
	views: {
		type: {
			map: (function (document) {
				// Is current task
				const isCurrentTask = !!document.timerRunning ? 100 : 0;
				// Is completed
				const notCompleted = undefined === document.completedDate ? 100 : 0;
				// Is in progress
				const isInProgress = 0 < document.events.length ? 100 : 0;
				// Time left until due date
				const timeLeftUntilDueDate = (
					document.dueDate
						? document.dueDate - (new Date().getTime())
					// Year in milliseconds
						: 31536000000
				);
				// Percentage of available time task will require to complete
				const percentageOfUsedTime = timeLeftUntilDueDate < 0
					? 100
					: (
						100 - (
							(
								timeLeftUntilDueDate - document.calculatedEstimatedTime + document.calculatedTimeSpent
							) / timeLeftUntilDueDate
						) * 100
					);
				// Estimated complete percentage
				const completePercentage = (
					document.calculatedTimeSpent / document.calculatedEstimatedTime
				) * 100;

				const priority = [
					isCurrentTask * 10,
					notCompleted * 8,
					isInProgress * 7,
					percentageOfUsedTime * 6,
					completePercentage * 5,
				].reduce((total, value) => total + value, 0);
				emit(
					[document.type, priority],
					parseInt(priority)
				);
			}).toString()
		}
	},
};