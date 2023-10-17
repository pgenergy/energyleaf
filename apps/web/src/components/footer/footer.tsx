export default function Footer() {
    return (
        <footer className="py-8 flex flex-row items-center justify-center gap-2 text-muted-foreground">
            <a className="hover:underline" href="https://www.iism.kit.edu/datenschutz.php" rel="noopener" target="_blank">
                Datenschutz
            </a>
            <p>|</p>
            <a className="hover:underline" href="https://www.iism.kit.edu/impressum.php" rel="noopener" target="_blank">
                Impressum
            </a>
        </footer>
    );
}
