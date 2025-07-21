import Navbar from "@/components/navbarLink/nav"

const pageProjetprospection = () => {
    return (
        <>
            <div className="flex min-h-screen bg-gray-50">
                <Navbar />
                <div className="w-full">
                    <div className="bg-gray-400 flex flex-row p-4 justify-between text-center">
                        <div className="flex flex-row gap-5">
                            <h1 className="font-bold">Projet prospection</h1>
                            <input type="text "
                            className="p-2 border "
                                placeholder="Recherche projet prospection"
                            />
                        </div>
                        <button className="p-2 bg-blue-950 border-none text-white">
                            Ajouter nouvelle projet prospection
                        </button>

                    </div>
                </div>
            </div>
        </>
    )
}

export default pageProjetprospection;