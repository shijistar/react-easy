import { getGlobalValueFromUrl } from '../utils/global';

export interface LocalizedDocProps {
  docEn: React.ComponentType;
  docCn: React.ComponentType;
}

const langFromUrl = getGlobalValueFromUrl('lang');
const LocalizedDoc = (props: LocalizedDocProps) => {
  const { docEn: DocEn, docCn: DocCn } = props;
  const lang = langFromUrl === 'zh-CN' ? 'zh-CN' : 'en-US';
  const Doc = lang === 'zh-CN' ? DocCn : DocEn;
  return <Doc />;
};

export default LocalizedDoc;
