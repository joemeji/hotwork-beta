import { avatarFallback } from "@/utils/avatar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { memo } from "react";
import { cn } from "@/lib/utils";

function AvatarProfile(props: AvatarProfileProps) {
  const {photo, firstname, lastname, avatarClassName, avatarColor, avatarFallbackClassName, avatarImageClassName} = props;
  return (
    <Avatar className={avatarClassName}>
      <AvatarImage className={cn('object-cover', avatarImageClassName)} src={photo} alt={firstname + ' ' +  lastname} />
      <AvatarFallback className={avatarFallbackClassName} style={{ background: avatarColor || '#ccc' }}>
        {avatarFallback(firstname || 'N', lastname || 'A')}
      </AvatarFallback>
    </Avatar>
  );
}

export default memo(AvatarProfile);

type AvatarProfileProps = {
  photo?: string
  firstname?: string
  lastname?: string
  avatarColor?: string
  avatarClassName?: string
  avatarFallbackClassName?: string
  avatarImageClassName?: string
};