export const shareResults = async ({ title, text, url }) => {
    if (navigator.share) { try { await navigator.share({ title, text, url }); return true; } catch (error) { return false; } }
    else { try { await navigator.clipboard.writeText(`${title}\n${text}\n${url}`); alert('Ссылка скопирована!'); return true; } catch (error) { return false; } }
  };
  export const copyToClipboard = async (text) => { try { await navigator.clipboard.writeText(text); return true; } catch (error) { return false; } };