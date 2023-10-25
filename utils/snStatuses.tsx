import { Ban, Box, Lock } from "lucide-react";
import { CheckCircle2, Hammer, ShieldCheck, ThumbsDown, Truck } from "lucide-react";

export const SN_ACTIVE = 'active';
export const SN_QUARANTINE = 'quarantine';
export const SN_DAMAGE = 'damage';
export const SN_ON_REPAIR = 'on_repair';
export const SN_TO_BE_SHIPPED = 'to_be_shipped';
export const SN_ONSHIPPING = 'onshipping';
export const SN_ONSOLD = 'sold';

export const snStatuses = [
  {
    text: 'Active',
    name: SN_ACTIVE,
    color: '34, 197, 94',
    icon: (props: any) => <CheckCircle2 {...props} color={`rgba(34, 197, 94)`} />
  },
  {
    text: 'Quarantine',
    name: SN_QUARANTINE,
    color: '69, 10, 10',
    icon: (props: any) => <ShieldCheck {...props} color={`rgba(69, 10, 10)`} />
  },
  {
    text: 'Damage',
    name: SN_DAMAGE,
    color: '220, 38, 38',
    icon: (props: any) => <ThumbsDown {...props} color={`rgba(220, 38, 38)`} />
  },
  {
    text: 'On Repair',
    name: SN_ON_REPAIR,
    color: '37, 99, 235',
    icon: (props: any) => <Hammer {...props} color={`rgba(37, 99, 235)`} />
  },
  {
    text: 'To be Shipped',
    name: SN_TO_BE_SHIPPED,
    color: '147, 51, 234',
    icon: (props: any) => <Box {...props} color={`#9333ea`} /> 
  },
  {
    text: 'On Shipping',
    name: SN_ONSHIPPING,
    color: '202, 138, 4',
    icon: (props: any) => <Truck {...props} color={`rgba(202, 138, 4)`} /> 
  },
  {
    text: 'On Sold',
    name: SN_ONSOLD,
    color: '133, 77, 14',
    icon: (props: any) => <Lock {...props} color={`rgb(133, 77, 14)`} />
  },
  {
    text: 'Undefined',
    name: 'undefined',
    color: '75, 85, 99',
    icon: (props: any) => <Ban {...props} color={`rgba(75, 85, 99)`} />
  },
];