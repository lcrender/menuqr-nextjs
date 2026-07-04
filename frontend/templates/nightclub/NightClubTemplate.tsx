import ProMobileTemplate, { type ProMobileTemplateProps } from '../promobile/ProMobileTemplate';

/** Layout Modern Food en tema oscuro, sin fotos de producto. */
export default function NightClubTemplate(props: ProMobileTemplateProps) {
  return <ProMobileTemplate {...props} appearance="nightClub" />;
}
