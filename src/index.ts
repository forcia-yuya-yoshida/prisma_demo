import { fluentSelectNG } from "./fluentSelectNG";
import { fluentSelectOK } from "./fluentSelectOK";
import { fluentSelectXact } from "./fluentSelectXact";
import { resetData } from "./resetData";

// データをリセット
await resetData();

// fluentAPIの挙動確認
await fluentSelectOK();
await fluentSelectNG();
await fluentSelectXact();
