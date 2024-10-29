import { FlashbarProps } from "@cloudscape-design/components";

export interface CustomFlashProps extends FlashbarProps.MessageDefinition {
    setNotifications: React.Dispatch<React.SetStateAction<FlashbarProps.MessageDefinition[]>>
}

export const flashbarMessage = ({header, type, content, setNotifications}: CustomFlashProps) => {
    const id = Math.random().toString();
    const item = {
        header: header,
        id: id,
        type: type,
        dismissible: true,
        dismissLabel: 'Dismiss message',
        onDismiss: () => setNotifications(items => items.filter(item => item.id !== id)),
        content: content
    }
    return item
}

export const fetchAdditionalData = async (url) => {
    const response = await fetch(convertToHttps(url));
    const data = await response.json();
    return data;
  };

export function convertToHttps(url: string) {
    if (url.startsWith("http://")) {
      return url.replace("http://", "https://");
    }
    return url;
  }