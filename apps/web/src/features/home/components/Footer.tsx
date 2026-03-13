export function Footer() {
	return (
		<footer className="site-footer">
			<div className="site-footer-inner">
				<p className="site-footer-logo font-display">naosu</p>
				<p className="site-footer-copy">
					© {new Date().getFullYear()} Naosu. Built for teams that care.
				</p>
			</div>
		</footer>
	);
}
