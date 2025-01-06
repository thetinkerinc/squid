<div class="flex gap-1" id="loading">
	<div class="dot h-2 w-2 rounded-full bg-[currentColor]"></div>
	<div class="dot h-2 w-2 rounded-full bg-[currentColor]"></div>
	<div class="dot h-2 w-2 rounded-full bg-[currentColor]"></div>
</div>

<style>
@keyframes jump {
	0% {
		translate: 0 0;
	}
	20% {
		translate: 0 -6px;
	}
	50% {
		translate: 0 2px;
	}
	65% {
		translate: 0 0;
	}
}

.dot {
	animation: jump 2s infinite;
}

#loading .dot:nth-child(2) {
	animation-delay: 0.15s;
}

#loading .dot:nth-child(3) {
	animation-delay: 0.3s;
}
</style>
