import Link from "next/link"
import { Button } from "../ui/button"

export const BackToHomeBtn = () => {
  return (
    <div className="max-w-xs sm:max-w-md mx-auto px-4 text-center mb-16">
        <Link href="/">
            <Button
              size="lg"
              className="
                font-normal
                border border-[#df7163] bg-[#df7163] text-[#f3f3f2]
                hover:bg-[#f3f3f2] hover:text-[#df7163] hover:border-[#df7163] hover:font-bold
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
