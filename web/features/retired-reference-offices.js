// Reference-only Office families: no controls, fitting, generation or texture initialization.
function pcReferenceOfficeRetired(value){const key=typeof value==='string'?value:value?.key||value?.id||'';return ['lind-stepped-lightweight','brick-commercial-lightweight'].some(id=>key===id||key.startsWith('template:'+id+'@'))||['lightweight-lind','lightweight-brick'].includes(value?.model?.format);}
function pcReferenceOfficeRecord(record){if(!record||typeof record!=='object'||typeof record.lotId!=='string')throw Error('Invalid archived Office history');return record;}
