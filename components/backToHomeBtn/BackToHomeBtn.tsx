import Link from "next/link"
import { Button } from "../ui/button"

export const BackToHomeBtn = () => {
  return (
    <div className="max-w-xs sm:max-w-md mx-auto px-4 text-center">
        <Link href="/">
            <Button
                size="lg"
                className="
                font-normal
                border border-rose-700 bg-rose-700 text-white
                hover:bg-white hover:text-rose-700 hover:border-rose-700 hover:font-bold
                shadow hover:shadow-lg
                whitespace-nowrap
                w-auto
                px-6
                "
            >
                Back to Home ≫
            </Button>
        </Link>
    </div>
  )
}
