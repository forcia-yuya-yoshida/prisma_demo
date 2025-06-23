import { fluentSelectNG } from "./fluentAPI/fluentSelectNG";
import { fluentSelectOK } from "./fluentAPI/fluentSelectOK";
import { fluentSelectXact } from "./fluentAPI/fluentSelectXact";
import { resetData } from "./fluentAPI/resetData";

// データをリセット
console.log("----------resetData----------");
await resetData();

// fluentAPIの挙動確認
console.log("----------fluentSelectOK----------");
await fluentSelectOK();
console.log("----------fluentSelectNG----------");
await fluentSelectNG();
console.log("----------fluentSelectXact----------");
await fluentSelectXact();
