import React from "react";
import { useFirestore } from "../../contexts/FirestoreContext";

export default function NewPortfolio(){
    const {
        activeUser,
        createPortfolio
      } = useFirestore();

    async function submitCreateNewPortfolio() {
        await createPortfolio(activeUser.username, activeUser.id);
      }

    return(
        <div className="bg-black min-w-95% min-h-98vh md:max-w-5xl rounded-lg border border-slate-500 shadow-lg items-center ">
              <div className="px-4 py-5 sm:px-6">
                <div>
                  <h3 className="py-9 text-xl align-content-center leading-6 font-small">
                    It looks like this is your first time here...
                  </h3>
                </div>
                <div className="px-10 py-10 " action="#">
                  <div className="flex justify-center pt-4 sm:px-6">
                    <button
                      className="bg-sky-500 hover:bg-sky-700 text-black font-bold py-2 px-4 rounded"
                      onClick={() => {
                        submitCreateNewPortfolio();
                      }}
                    >
                      Create Portfolio
                    </button>
                  </div>
                </div>
              </div>
            </div>
    );
};