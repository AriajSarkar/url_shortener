"use client";
import DarkModeToggle from "./DarkModeToggle";
import Logo from '../../../../public/logo.png'
import Image from "next/image";

const NavBar = () => {
    return (
        <nav className="flex items-center justify-between p-4 bg-white dark:bg-gray-950/85 shadow-md dark:shadow-gray-500/90 dark:bg-blend-soft-light">
            {/* Logo on the left */}
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                <Image src={Logo} alt="Logo" width={100} height={100} />
            </div>

            {/* Removed Dark Mode Toggle */}
            <div className="flex items-center">
                <DarkModeToggle />
            </div>
        </nav>
    );
};

export default NavBar;
