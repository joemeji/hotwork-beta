import Avatar from "./avatar";
import HeaderIcons from "./header-icons";
import TopSidebar from "../sidebar/top-sidebar";
import { cn } from "@/lib/utils";
import SearchBar from "@/components/search-bar";
import { useContext } from "react";
import { BreakPointContext } from "@/context/layout-context";
type HeaderProp = {
  onToggleSidebar?: () => void
}

export default function Header({ onToggleSidebar }: HeaderProp) {
  const bp = useContext(BreakPointContext);
  const inlineWidth = 33.33;

  const sideWidths = () => {
    if (bp === 'md') {

    }
  }

  return (
    <header 
      className={cn(
        'flex fixed top-0 right-0 h-[var(--header-height)] w-full bg-white shadow-sm z-10',
        'd-flex'
      )}
    >
      <div className="w-[33.33%]">
        <TopSidebar 
          inHeader={true} 
          onToggleSidebar={onToggleSidebar} 
        />
      </div>
      <div className="w-[33.33%] flex h-full items-center justify-center"
        style={{
          width: bp === 'md' ? '370px' : '33.33%',
          marginLeft: bp === 'md' ? 'auto' : 'inherit',
          marginRight: bp === 'md' ? '10px' : 'inherit',
        }}
      >
        <div className={cn(
            'w-full',
            (bp === 'sm' || bp === 'xs') && 'hidden'
          )}
        >
          <SearchBar />
        </div>
      </div>
      <div className="flex items-center gap-1 md:gap-3 w-[33.33%] pe-4 justify-end"
        style={{
          width: bp === 'md' ? 'auto' : '33.33%',
        }}
      >
        <HeaderIcons />
        <Avatar />
      </div>
    </header>
  );
}

