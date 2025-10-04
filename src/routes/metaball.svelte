<script lang="ts">
let { visible = true }: Props = $props();

import { onMount } from 'svelte';
import * as _ from 'radashi';

interface Props {
	visible?: boolean;
}

onMount(() => {
	boundPositions();
	move();
});

const dir = Math.random() * (Math.PI / 3 - Math.PI / 6) + Math.PI / 6;
let dx = rs() * Math.cos(dir);
let dy = rs() * Math.sin(dir);

let top: number;
let bottom: number;
let left: number;
let right: number;
let growDirection: number;
let growSpeed: number;
let growDuration: number;

let r = $state<number>(_.random(50, 150));
let x = $state<number>(_.random(0, 1000));
let y = $state<number>(_.random(0, 1000));

function boundPositions() {
	const bg = document.getElementById('bg');
	if (!bg) {
		return;
	}
	({ top, bottom, left, right } = bg.getBoundingClientRect());
	top = top + r;
	bottom = bottom - r;
	left = left + r;
	right = right - r;
	x = _.clamp(x, left, right);
	y = _.clamp(y, top, bottom);
}

function move() {
	x += dx;
	y += dy;

	if (x > right || x < left) {
		dx *= -1;
	}
	if (y > bottom || y < top) {
		dy *= -1;
	}

	if (!growDuration) {
		growDuration = _.random(100, 500);
		growSpeed = Math.random() * 0.1;
		growDirection = rs();
	}
	r = _.clamp(r + growDirection * growSpeed, 50, 150);
	boundPositions();
	growDuration -= 1;

	requestAnimationFrame(move);
}

function rs() {
	return Math.random() > 0.5 ? 1 : -1;
}
</script>

<svelte:window onresize={boundPositions} />
<circle cx={x} cy={y} {r} fill={visible ? '#ffbc94' : 'none'}></circle>
