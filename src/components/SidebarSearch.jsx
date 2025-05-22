import { useContext, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { NavLink } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const SidebarSearch = () => {
  const { searchAllUsers, user } = useContext(UserContext);
  const [search, setSearch] = useState("");

  return (
    <div className="w-full flex flex-col items-center mb-4">
      <div className="bg-[#e2e2e2de] h-10 p-2 rounded-3xl w-full flex items-center relative">
        <CiSearch className="text-xl mr-2 text-[#9e9e9e]" />
        <input
          onChange={(e) => {
            setSearch(e.target.value);
            searchAllUsers(e.target.value);
          }}
          value={search}
          className="w-full h-full bg-transparent outline-none text-black placeholder:text-gray-500"
          placeholder="Pesquisa rápida de militar"
          type="text"
        />
        {/* Resultados da busca */}
        {search && (
          <div className="w-full p-2 flex flex-col bg-white absolute left-0 top-[110%] z-20 max-h-60 overflow-y-auto rounded-lg shadow-lg border border-gray-200">
            {user.users && user.users.length > 0 ? (
              user.users.map((user) => (
                <NavLink
                  to={`/search/${user.nickname}`}
                  key={user._id}
                  className="p-2 hover:bg-gray-200 rounded text-black"
                  onClick={() => setSearch("")}
                >
                  {user.nickname}
                </NavLink>
              ))
            ) : (
              <div className="p-2 text-gray-500">Usuário não encontrado</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarSearch; 