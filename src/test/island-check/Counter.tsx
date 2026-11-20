import { useState } from "react";

// Test only island: proves a hydrated React island fetches the React runtime (spec 0002, AC-3).
export default function Counter() {
	const [count, setCount] = useState(0);
	return (
		<button type="button" onClick={() => setCount((value) => value + 1)}>
			Island clicks: {count}
		</button>
	);
}
